# 省钱单机部署 · Budget single-box deploy

部署 **sydneyfishing.au**,用 **悉尼(ap-southeast-2)的一台 AWS Lightsail 服务器**。
一台机器通过 Docker Compose 跑全部组件:**Caddy**(自动 HTTPS + 托管静态 PWA + 反向代理)
+ **Fastify API** + **Postgres**。PWA 与 API 同源 → **无需 CORS、第一方 cookie**。
照片存在本机磁盘。成本 ≈ **AUD 8–16/月** + 域名。

> 这是选定的低成本方案(非商用 Open-Meteo + 自托管照片)。更完整的解耦架构(托管 PG + R2 +
> CloudFront)见 [DEPLOY.md](DEPLOY.md) —— 只有当一台机器扛不住时才用那套。

```
            sydneyfishing.au  (GoDaddy A 记录 → 服务器公网 IP)
                     │ :443 Let's Encrypt（自动签发）
        ┌────────────▼──────────── 一台 Lightsail VM · Docker Compose ┐
        │  caddy   /          → 静态 PWA (/srv)                       │
        │          /api/*,/uploads/* → api:3000                      │
        │  api (Fastify)  ───────────────  db (postgres + 数据卷)     │
        └────────────────────────────────────────────────────────────┘
   天气: 浏览器 → api.open-meteo.com（非商用，保持不变）
```

---

## 0. 开通服务器（VM）

1. Lightsail → **Create instance** → 区域 **Sydney (ap-southeast-2)** → **Linux/Unix → OS Only →
   Ubuntu 22.04**。套餐:**1 GB（$5/月）**最合适(512 MB 对 `sharp` 太紧)。
2. **Networking → IPv4 firewall**:放行 **TCP 22、80、443**。绑一个 **Static IP**(绑定期间免费)。
3. SSH 登录(Lightsail 网页 SSH 或你的密钥)。

```bash
# Docker + compose 插件
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER && newgrp docker
# 1 GB 内存在 sharp 缩放图片时偏紧 → 加 2 GB swap
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### CentOS / Rocky / Alma / CentOS Stream variant

Lightsail has **no CentOS blueprint**, so this applies when the box runs on another host (EC2,
Vultr, Aliyun, …). **Keep it in Australia (`ap-southeast-2` / Sydney) for data residency.** Replace
the `apt-get` block above with:

```bash
# Docker CE + compose plugin — official script covers CentOS 7 / Stream 8·9 / Rocky / Alma
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
sudo usermod -aG docker $USER && newgrp docker
sudo yum install -y git            # on 8+/Rocky/Alma: sudo dnf install -y git
docker compose version             # confirm compose v2 (NOT the legacy docker-compose)

# swap: identical fallocate/mkswap/swapon as above

# firewalld (CentOS runs it by default; there is no Lightsail cloud firewall here):
sudo firewall-cmd --permanent --add-service=http --add-service=https --add-service=ssh
sudo firewall-cmd --reload         # ALSO open 80/443/22 in your host's security group
```

**SELinux: no action needed.** The compose stack uses named volumes (`pgdata` / `uploads` /
`caddy_data` / `caddy_config`), which Docker labels automatically even in enforcing mode — only
bind mounts would need a `:Z` flag.

## 1. DNS（GoDaddy）

在 GoDaddy → **My Products → DNS**(域名 `sydneyfishing.au`):
- **A** 记录:主机 `@` → **值 = 那个 Static IP**,TTL 600。
- (可选 `www`:见 [Caddyfile](Caddyfile) 里的说明 —— 默认省略,只保留一条记录。)

等它生效:执行第 3 步前,`dig +short sydneyfishing.au` 应返回你的 IP
(Caddy 申请 TLS 证书需要它)。

## 2. 克隆 + 密钥

```bash
git clone https://github.com/weckson/SydneyFishing.git && cd SydneyFishing
# 根目录 .env 存生产密钥。它已被 gitignore —— 绝不要提交。
cat > .env <<EOF
COOKIE_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)        # 纯字母数字 → 放进 DATABASE_URL 里安全
ACME_EMAIL=a290191715@gmail.com
EOF
chmod 600 .env
```

## 3. 启动

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
这会构建 API + Caddy 镜像、启动 Postgres、**自动应用数据库 schema**(`migrate.js`),
并让 Caddy 为 `sydneyfishing.au` 申请 Let's Encrypt 证书。首次启动约 1–2 分钟。

**验证:**
```bash
curl -s https://sydneyfishing.au/healthz     # {"ok":true,...}
curl -s https://sydneyfishing.au/readyz      # {"ok":true,"db":"up"}   ← 数据库可达
```
然后打开 https://sydneyfishing.au —— 地图/评分立即可用;注册一个账号。

## 4. 把自己设为管理员（开启 🛡️ 审核 / 下架）

审核面板(#/admin)和下架接口要求 `role IN ('admin','moderator')`。
在 App 里注册账号后,提权一次:
```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U sf -d sydneyfishing -c "UPDATE users SET role='admin' WHERE email='a290191715@gmail.com';"
```
重新登录;头部会出现 **🛡️ 审核** 按钮。用户用任意渔获上的 🚩 举报,你在 `#/admin` 处理
(下架 = 软删除 + 隐藏照片;Dismiss = 标记已处理)。详见 `SCOPE.md` / `DEPLOY.md` §12 ——
这是公开开放照片前的最低门槛。

## 5. 备份（务必做）

单机 = 一定要备份数据库。用宿主机 cron 每晚 `pg_dump`,保留 7 天:
```bash
mkdir -p ~/backups
( crontab -l 2>/dev/null; echo '0 15 * * * cd ~/SydneyFishing && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U sf sydneyfishing | gzip > ~/backups/sf-$(date +\%F).sql.gz && find ~/backups -name "*.sql.gz" -mtime +7 -delete' ) | crontab -
```
同时开启 **Lightsail 自动快照**(实例级,会覆盖含照片的 Docker 数据卷)。
恢复某个备份:`gunzip -c sf-YYYY-MM-DD.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U sf -d sydneyfishing`。

## 6. 代码更新后

你在两台机器上开发 → 推到 GitHub,然后在服务器上:
```bash
cd ~/SydneyFishing && git pull
docker compose -f docker-compose.prod.yml up -d --build   # 重建 api + caddy,重跑幂等的 migrate
```
Caddy 会提供新的 PWA 文件(从仓库重新构建)。每次 PWA 发版会 bump SW 缓存版本,且 Caddy 对
`index.html`/`service-worker.js` 发送 `no-cache`,所以更新很快生效。

---

## 说明 / 决策

- **CSP 不变。** `index.html` 的 CSP 用 `'self'`(覆盖同源 API 与 `/uploads` 图片),外加
  Open-Meteo 与地图瓦片。其中 `http://localhost:3000` 那几项在生产里无害(页面只能访问访问者
  *自己的* localhost),还能保留本地开发;想再硬化可以之后删掉。
- **Open-Meteo = 非商用。** 免费层,约 1 万次/天,从浏览器调用。保留 Open-Meteo 署名。若要
  商业化或触达限额,买 Standard(~$29/月),并/或把天气挪到带缓存的后端代理(见 DEPLOY.md §0)。
- **合规:** 服务器 + 数据库 + 照片都在 **悉尼(ap-southeast-2)** → 数据留在澳洲境内。
- **邮箱验证** 默认关(`REQUIRE_EMAIL_VERIFY=false`);验证链接打印到 `docker compose logs api`。
  以后接好 SES 再开(见 DEPLOY.md §8)。
- **扩容** 只在需要时:把 Lightsail 套餐升到 2 GB,或把照片迁到 R2(设 `s3` 存储驱动)——
  无需改 schema 或调用方代码。
