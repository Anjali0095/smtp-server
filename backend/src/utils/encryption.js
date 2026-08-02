const crypto = require("crypto");

// Derive a stable 32-byte key from whatever ENCRYPTION_KEY string is provided,
// so any length/format of key in .env works safely with AES-256-CBC.
function getKey() {
  const raw = process.env.ENCRYPTION_KEY || "";
  return crypto.createHash("sha256").update(raw).digest();
}

function encrypt(text) {
  if (text === null || text === undefined || text === "") return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(payload) {
  if (!payload) return null;
  const [ivHex, dataHex] = payload.split(":");
  if (!ivHex || !dataHex) return null;
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };
