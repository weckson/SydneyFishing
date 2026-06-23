# 部署指南 · DEPLOY (AWS Lightsail, ap-southeast-2)

面向单人、低成本的生产部署。架构:静态 PWA(仓库根目录)+ Fastify/PostgreSQL 后端(`server/`)。
下文用 `your-domain` 占位,API 用 `api.your-domain`,图片用 `media.your-domain`,请全部替换为你的真实域名。

> 术语:本平台是**线上经验交流社区**,不做线下约见/拼船撮合(见 [SCOPE.md](SCOPE.md))。

---

## 🚀 软启动模式 · Soft launch (cheapest, lowest risk)

`feature/soft-launch` 分支默认**关掉两个功能**,让你不配 R2、不配 SES、不买付费天气就能便宜上线试用:

| 功能 | 软启动 | 说明 |
|---|---|---|
| 图片上传 `FEATURE_PHOTOS` | **关** | 去掉公开上线的图片审核(CSAM)硬门槛;不需要 R2/§6,无图片流量费 |
| 邮箱验证 `FEATURE_EMAIL_VERIFY` | **关** | 不需要 SES/§8 |
| 钓获(纯文字)/评论/论坛/鱼讯 | 开 | 让大家试用的核心 |

**软启动只需这些环境变量**(其余 §2 的 R2/SES 变量都不用设):
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://<user>:<pw>@<endpoint>:5432/<db>?sslmode=require
COOKIE_SECRET=<§4 生成>
CORS_ORIGINS=https://your-domain,https://www.your-domain
PUBLIC_BASE_URL=https://api.your-domain
TRUST_PROXY_HOPS=1
# 功能开关(本分支默认就是这样,可不写;要开回来改成 true)
FEATURE_PHOTOS=false
FEATURE_EMAIL_VERIFY=false
```
- CSP(§5):软启动不用 R2,`img-src` 去掉 `media.` 那项即可;`connect-src` 仍需 API 域 + Open-Meteo。
- 服务端会**真正关闭**被禁用功能的接口(不只是藏 UI),PWA 通过 `GET /api/meta` 自动隐藏入口。
- 跳过 §3 也行:想最省可让容器用 `@fastify/static` 直接服务 PWA(单机一个容器),省掉 S3+CloudFront。

**软启动月成本**:Lightsail 容器 Micro(~AUD16)+ Postgres Standard(~AUD23)+ 域名 ≈ **AUD 40/月**,无 R2/SES/付费天气。
> 绝对最省(更费心):用一台 Lightsail **VM 实例** $5–10/月,自己装 Node+Postgres+Caddy(自动 TLS),全放一台。省钱但要自己运维补丁/备份。

**准备好全量上线时**:把 `FEATURE_PHOTOS`/`FEATURE_EMAIL_VERIFY` 改 `true`,按 §6 配 R2、§8 配 SES,并先补上"图片审核 + 隐私政策"(§12)。

> ✅ **审核**:把你的邮箱填进 `ADMIN_EMAILS`(逗号分隔),该账号即成管理员,可在界面上**删除任意论坛帖/回复、评论、渔获**——无需改库。不当内容点"删除"即下架(软删,可恢复)。

---

## 0. 先定 Open-Meteo(阻塞决策)

PWA 目前直接从浏览器调用 `api.open-meteo.com` / `marine-api.open-meteo.com` 做评分。
**Open-Meteo 免费层是"非商用"的**(其条款把"含订阅/广告的 App"明确列为商用),且上限约
**1 万次/天**。研究结论与建议:

- **推荐(上线即做)**:买 **Open-Meteo Standard 订阅 ≈ US$29/月**(100 万次/月,含商用许可、API key)。
  这是用**单一供应商**合法拿到 浪高/周期 + 含潮汐海平面 + 天气 三类数据的最便宜方式,固定月费、无超量惊吓。
- 备选:**WillyWeather**(澳洲本地、BOM 数据,NSW 精度最好,按元素计费)、**Stormglass Medium €49/月**(海况专精)。
  这些留给"增长期/精度抱怨"时切换。
- **避免**:WorldTides(许可禁止跨用户缓存)、直连 BOM(免费数据禁商用)、NOAA(无澳洲潮汐站)。
- **数据本身是 CC BY 4.0**:无论用哪个,页面需保留 Open-Meteo 署名链接。

> 工程对策(下一步,非本次):把天气调用挪到后端做**带缓存的代理 + 供应商抽象**(和 `storage.js` 一样的可插拔模式)。
> 这样商用 key 不进浏览器、多用户同点合并成几次上游调用,基本能长期待在便宜档。本次未实现,但接口已为此预留。

---

## 1. Lightsail 托管 PostgreSQL

1. 控制台 → Databases → Create → 区域 **ap-southeast-2** → 引擎 **PostgreSQL 16** → 计划 **Standard $15/月**(1GB/40GB,单 AZ,上线够用)。
2. 记下 endpoint host、端口 5432、库名、主用户/密码。
3. Networking:**关闭 Public mode**(仅允许容器访问);跑迁移时可临时开公网+你的 IP,跑完关掉。
4. 连接串(Lightsail PG **强制 TLS**,代码已自动启用 SSL):
   ```
   postgres://<user>:<pw>@<endpoint>:5432/<db>?sslmode=require
   ```

> Redis 上线**不需要**:会话是 Postgres `sessions` 表里的不透明 token,限流是容器内存级。等扩到多容器再加(Upstash 免费档或 $5 小实例)。

---

## 2. Lightsail 容器服务(后端)

1. Containers → Create container service → 区域 ap-southeast-2 → **Micro(0.25vCPU/512MB)$10/月**,scale 1。
   (sharp 处理大图吃内存,若上传 OOM 就升 **Small 1GB $20/月**。)
2. 构建并推送镜像(在 `server/`,需先装 aws-cli 的 lightsail 插件):
   ```bash
   cd server
   docker build -t sf-api:latest .
   aws lightsail push-container-image --region ap-southeast-2 \
     --service-name sf-api --label sf-api --image sf-api:latest
   # 输出形如 :sf-api.sf-api.3 —— 用于下面 deployment
   ```
3. 创建 deployment:容器端口 `3000`/HTTP,**public endpoint 健康检查路径 `/healthz`**,环境变量(见 §4/§5/§6):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgres://<user>:<pw>@<endpoint>:5432/<db>?sslmode=require
   COOKIE_SECRET=<§4 生成的 64 位 hex>
   CORS_ORIGINS=https://your-domain,https://www.your-domain
   PUBLIC_BASE_URL=https://api.your-domain
   TRUST_PROXY_HOPS=1
   REQUIRE_EMAIL_VERIFY=false
   STORAGE_DRIVER=s3
   S3_ENDPOINT=https://<r2-account-id>.r2.cloudflarestorage.com
   S3_BUCKET=sf-media
   S3_REGION=auto
   S3_PUBLIC_BASE=https://media.your-domain
   S3_ACCESS_KEY_ID=<r2 key>
   S3_SECRET_ACCESS_KEY=<r2 secret>
   ```

> 生产配置自检:后端在 `NODE_ENV=production` 下,若 `COOKIE_SECRET` 仍是 dev 默认、`DATABASE_URL` 未设、
> 或 `CORS_ORIGINS` 含非 https/localhost,会**直接拒绝启动**并报明原因(`config.js`)。这是有意的"快速失败"。

---

## 3. 静态 PWA 托管(S3 + CloudFront)

把静态站和 API 解耦,后端重部署不影响地图页。

1. S3 桶 `your-pwa`(ap-southeast-2),Block public access 开,CloudFront 用 OAC 读。
2. 上传根目录(排除 server/、.git、md):
   ```bash
   aws s3 sync . s3://your-pwa --region ap-southeast-2 \
     --exclude "server/*" --exclude ".git/*" --exclude "*.md" \
     --cache-control "public, max-age=3600"
   # index.html 与 service-worker.js 用 no-cache 覆盖一次,保证更新立即生效
   aws s3 cp index.html s3://your-pwa/index.html --cache-control "no-cache"
   aws s3 cp service-worker.js s3://your-pwa/service-worker.js --cache-control "no-cache"
   ```
3. CloudFront:origin=该 S3(OAC),默认根对象 `index.html`,viewer 强制 HTTPS,开压缩。

---

## 4. 密钥

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # COOKIE_SECRET
```
设为容器环境变量,**不要进 git**(轮换它会让所有人重新登录)。Lightsail 容器环境变量静态加密,单人 MVP 可接受;另存密码管理器。

---

## 5. 域名 / TLS / CSP / CORS

**DNS**:`your-domain` + `www` → CloudFront;`api.your-domain` → 容器 public endpoint;`media.your-domain` → R2(§6)。
**TLS**:API 在 Lightsail 容器服务 → Custom domains 绑 `api.your-domain`(自动签发续期);PWA 需在 **us-east-1 申请 ACM 证书**给 CloudFront。

**CSP** —— 改 `index.html` 顶部那段 `<meta http-equiv="Content-Security-Policy">`,把 dev 的 localhost 换成生产源:
```
img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://media.your-domain https://api.your-domain;
connect-src 'self' https://api.your-domain https://api.open-meteo.com https://marine-api.open-meteo.com;
```
- 删掉所有 `http://localhost...`;
- `img-src` 加 R2 公共域(`media.`)与 API 域;
- `connect-src` 加 API 域;若选了天气代理则去掉 open-meteo 两个域。
- 在 app 脚本前加:`<script>window.SF_CONFIG={apiBase:"https://api.your-domain"}</script>`(告诉 PWA 后端地址)。

**CORS**(容器环境变量,必须是 **PWA 的源**,不是 API 源,无尾斜杠):
```
CORS_ORIGINS=https://your-domain,https://www.your-domain
```
> Cookie:`api.your-domain` 与 `your-domain` 属同一注册域(same-site),默认 `SameSite=lax` 即可跨子域带上会话。
> 仅当 API 放在**完全不同的域**时,才设 `COOKIE_SAMESITE=none`(届时自动 Secure)。

---

## 6. Cloudflare R2(用户图片,零出流量费)

1. R2 → Create bucket `sf-media`。
2. R2 → API Tokens → 建 Object Read&Write token(限 `sf-media`),记 Access Key ID / Secret。
3. endpoint:`https://<account-id>.r2.cloudflarestorage.com`。
4. 公共访问:bucket → Settings → 绑定自定义域 `media.your-domain`(Cloudflare 出证书+CDN,出流量免费)。
5. 容器设 `STORAGE_DRIVER=s3` + 5 个 `S3_*`(见 §2)。驱动首次使用会校验五项齐全,缺任一则上传 500。
   `S3_PUBLIC_BASE` 必须等于你写进 `img-src` 的 `media.` 域。

---

## 7. 数据库迁移

库建好后跑一次(幂等,`schema.sql` 全是 `CREATE ... IF NOT EXISTS`):
```bash
# 方式 A:本机(临时开 DB 公网+你的 IP)
cd server
DATABASE_URL='postgres://<user>:<pw>@<endpoint>:5432/<db>?sslmode=require' npm run migrate
# 跑完把 DB 公网关掉
```
验证:
```bash
curl https://api.your-domain/healthz   # {"ok":true,...}
curl https://api.your-domain/readyz    # {"ok":true,"db":"up"}  ← 确认 DB+SSL 通
```

---

## 8. 邮件(SES)+ 沙箱坑

代码有 `REQUIRE_EMAIL_VERIFY`(默认 `false`,dev 邮件器只打印链接)。
- **上线先保持 `false`**(用户不被拦,验证链接进日志);接好 SES 且出沙箱后再开。
- 开真邮件:SES 验证域名(加 DKIM CNAME)+ 发件地址;**新账号在沙箱**只能发给已验证地址、200/天 ——
  上线前先 **申请生产权限**(通常 <24h)。然后在 `src/mailer.js` 接 SES、设 `SES_FROM`、给容器加 SES 发送 IAM 权限,再把 `REQUIRE_EMAIL_VERIFY=true`。

---

## 9. 备份 / 监控 / 成本告警

- **DB 备份**:Lightsail 托管 PG 默认每日快照(留 7 天)——确认开着;每次迁移/部署前手动快照一次。
- **监控**:容器 CPU/内存内置;设 CloudWatch 告警(CPU>80%、DB 剩余存储<20%);看容器日志里的 sharp OOM / DB SSL 报错。
- **成本告警(务必做)**:Billing → Budgets → 月预算 **~AUD 70**,80%/100% 邮件提醒。
- **Uptime**:UptimeRobot 免费,每 5 分钟打 `/healthz`。

---

## 10. 回滚

- **应用**:Lightsail 保留历史 deployment,重部署上一个镜像 ref(`:sf-api.sf-api.X-1`),约 2-3 分钟,无数据丢失。
- **PWA**:重新 `s3 sync` 上个版本 + CloudFront invalidation(`/index.html`、`/service-worker.js`);因 SW 是 cache-first,记得 bump SW 缓存版本。
- **DB**:schema 是加法/幂等,通常应用回滚即可;坏的数据迁移则用部署前手动快照恢复到新库、重指 `DATABASE_URL`。

---

## 11. 月成本估算(AUD,上线期)

| 项 | 计划 | ~AUD/月 |
|---|---|---|
| Lightsail 容器 | Micro | ~16 |
| Lightsail PostgreSQL | Standard $15 | ~23 |
| S3 + CloudFront(静态) | 低流量 | ~2 |
| Cloudflare R2(图片) | 10GB 免费档,零出流量 | ~0–2 |
| DNS / SES / ACM | Cloudflare DNS 免费 / SES 近免费 / 证书免费 | ~1 |
| **AWS 小计** | | **~42–45** |
| Open-Meteo 商用(方案 A) | €29 ≈ | ~48 |
| **合计** | | **~AUD 90–95/月** |

不买 Open-Meteo(纯非商用)则 ~AUD 42–45/月。最大成本杠杆就是 §0 的天气决策。

---

## 12. 安全状态

**已在代码中加固(本次)**:
- 生产环境对弱默认密钥/明文 CORS **快速失败**(`config.js`)
- Postgres **TLS**(`db.js`,prod/`sslmode=require` 自动开)
- Dockerfile **非 root 运行**(`USER node`)
- `/readyz` 不再泄露 DB 错误详情
- 上传图 **限像素**防解压炸弹;存储 key **白名单**防路径穿越
- 代理跳数可配(防 XFF 伪造绕过限流);验证链接用 `PUBLIC_BASE_URL` 而非 Host 头

**上线前仍必须补(需要你/运营)**:
- ⛔ **图片内容审核**:目前用户照片**无任何审核**。图片社区在澳洲有法定义务。最低限度:给钓获/评论加举报入口 +
  一个能下架的管理后台;有条件接 AWS Rekognition + CSAM 哈希匹配("保留并上报",绝不静默删除)。**这是公开上线的硬门槛。**
- 📄 **隐私政策 / ToS 页面**(APPs 合规)+ 数据导出/删除(DSAR)路径。
- 🔑 反滥用增强:注册验证码、密码泄露库校验、登录锁定。

---

### 上线前自检清单
- [ ] §0 Open-Meteo 许可已定
- [ ] `npm run migrate` 已跑,`/readyz` = `db:up`(确认 TLS 通)
- [ ] `COOKIE_SECRET` 强随机;生产配置自检通过(能启动)
- [ ] CSP 去掉 localhost、加生产源;`SF_CONFIG.apiBase` 已设
- [ ] `CORS_ORIGINS` = PWA 源,无 API 源、无尾斜杠
- [ ] 5 个 `S3_*` 齐全;测试图能从 `media.` 域加载
- [ ] 手动 DB 快照已做,每日备份确认开
- [ ] Billing 预算告警 ~AUD 70
- [ ] 图片审核/举报方案到位(硬门槛)
- [ ] 隐私政策 / ToS 上线
