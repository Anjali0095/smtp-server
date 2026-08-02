const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/auth");
const { encrypt } = require("../utils/encryption");

const router = express.Router();
router.use(requireAuth);

function serializeDomain(row) {
  return {
    id: row.id,
    domain_name: row.domain_name,
    verified: row.verified,
    smtp_host: row.smtp_host,
    smtp_port: row.smtp_port,
    smtp_username: row.smtp_username,
    smtp_secure: row.smtp_secure,
    from_email: row.from_email,
    has_smtp_password: !!row.smtp_password_encrypted,
    created_at: row.created_at,
  };
}

// GET /api/domains
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, COUNT(r.id)::int AS record_count
       FROM domains d
       LEFT JOIN dns_records r ON r.domain_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [req.userId]
    );
    res.json({ domains: result.rows.map((r) => ({ ...serializeDomain(r), record_count: r.record_count })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch domains" });
  }
});

// POST /api/domains
router.post("/", async (req, res) => {
  try {
    const { domain_name } = req.body;
    if (!domain_name) return res.status(400).json({ error: "domain_name is required" });

    const domainPattern = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/;
    if (!domainPattern.test(domain_name)) {
      return res.status(400).json({ error: "Please enter a valid domain name, e.g. example.com" });
    }

    const result = await pool.query(
      "INSERT INTO domains (user_id, domain_name) VALUES ($1, $2) RETURNING *",
      [req.userId, domain_name.toLowerCase()]
    );
    res.status(201).json({ domain: serializeDomain(result.rows[0]) });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "You already added this domain" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create domain" });
  }
});

// GET /api/domains/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM domains WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Domain not found" });
    res.json({ domain: serializeDomain(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch domain" });
  }
});

// PUT /api/domains/:id  (SMTP settings + verified flag)
router.put("/:id", async (req, res) => {
  try {
    const owner = await pool.query("SELECT id FROM domains WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    if (owner.rows.length === 0) return res.status(404).json({ error: "Domain not found" });

    const { smtp_host, smtp_port, smtp_username, smtp_password, smtp_secure, from_email, verified } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    const push = (col, val) => {
      fields.push(`${col} = $${i}`);
      values.push(val);
      i += 1;
    };

    if (smtp_host !== undefined) push("smtp_host", smtp_host);
    if (smtp_port !== undefined) push("smtp_port", smtp_port);
    if (smtp_username !== undefined) push("smtp_username", smtp_username);
    if (smtp_secure !== undefined) push("smtp_secure", smtp_secure);
    if (from_email !== undefined) push("from_email", from_email);
    if (verified !== undefined) push("verified", verified);
    if (smtp_password) push("smtp_password_encrypted", encrypt(smtp_password));

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE domains SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json({ domain: serializeDomain(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update domain" });
  }
});

// DELETE /api/domains/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM domains WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Domain not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete domain" });
  }
});

module.exports = router;
