import crypto from "node:crypto";
import sharp from "sharp";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";
import { saveImage } from "../storage.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 12 * 1024 * 1024;

// Upload one image. Pipeline: auto-orient -> STRIP all metadata (sharp drops EXIF/GPS by
// default) -> re-encode to WebP in two sizes (thumb + large). The original (and its GPS) is
// never stored or served. Returns the media id + public paths.
export default async function mediaRoutes(app) {
  app.post("/", {
    preHandler: requireAuth,
    config: { rateLimit: { max: 40, timeWindow: "10 minutes" } }
  }, async (req, reply) => {
    if (!req.isMultipart()) return reply.code(400).send({ error: "not_multipart" });
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: "no_file", message: "未收到文件" });
    if (!ALLOWED.has(file.mimetype)) {
      return reply.code(415).send({ error: "unsupported_type", message: "仅支持 JPG / PNG / WEBP" });
    }

    let buf;
    try { buf = await file.toBuffer(); }
    catch (e) { return reply.code(413).send({ error: "too_large", message: "图片过大（≤12MB）" }); }
    if (file.file.truncated || buf.length > MAX_BYTES) {
      return reply.code(413).send({ error: "too_large", message: "图片过大（≤12MB）" });
    }

    let large, thumb, meta;
    try {
      const base = sharp(buf, { failOn: "none" }).rotate(); // auto-orient, then drop the tag
      meta = await base.metadata();
      large = await base.clone()
        .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 }).toBuffer();
      thumb = await base.clone()
        .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 72 }).toBuffer();
    } catch (e) {
      return reply.code(400).send({ error: "bad_image", message: "无法识别的图片" });
    }

    const rid = crypto.randomBytes(8).toString("hex");
    const keyBase = `catch/${req.user.id}/${rid}`;
    const full = await saveImage(`${keyBase}_lg.webp`, large);
    const tmb = await saveImage(`${keyBase}_thumb.webp`, thumb);

    const { rows } = await query(
      `INSERT INTO media (owner_id, storage_key, mime, width, height, bytes, exif_stripped)
       VALUES ($1,$2,'image/webp',$3,$4,$5,true) RETURNING id`,
      [req.user.id, keyBase, meta?.width ?? null, meta?.height ?? null, large.length]
    );
    return reply.code(201).send({ id: rows[0].id, thumb: tmb, full });
  });
}
