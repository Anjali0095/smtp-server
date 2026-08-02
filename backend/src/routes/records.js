const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const VALID_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "DMARC", "SPF", "NS", "DKIM"];

async function assertDomainOwnership(domainId, userId) {
  const result = await pool.query("SELECT id FROM domains WHERE id = $1 AND user_id = $2", [
    domainId,
    userId,
  ]);
  return result.rows.length > 0;
}

// GET /api/domains/:domainId/records
router.get("/:domainId/records", async (req, res) => {
  try {
    const owns = await assertDomainOwnership(req.params.domainId, req.userId);
    if (!owns) return res.status(404).json({ error: "Domain not found" });

    const result = await pool.query(
      "SELECT * FROM dns_records WHERE domain_id = $1 ORDER BY created_at DESC",
      [req.params.domainId]
    );
    res.json({ records: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// POST /api/domains/:domainId/records
router.post("/:domainId/records", async (req, res) => {
  try {
    const owns = await assertDomainOwnership(req.params.domainId, req.userId);
    if (!owns) return res.status(404).json({ error: "Domain not found" });

    const { type, name, value, ttl, priority } = req.body;
    if (!type || !name || !value) {
      return res.status(400).json({ error: "type, name and value are required" });
    }
    if (!VALID_TYPES.includes(type.toUpperCase())) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const result = await pool.query(
      `INSERT INTO dns_records (domain_id, type, name, value, ttl, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.domainId, type.toUpperCase(), name, value, ttl || 3600, priority || null]
    );
    res.status(201).json({ record: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// PUT /api/domains/:domainId/records/:recordId
router.put("/:domainId/records/:recordId", async (req, res) => {
  try {
    const owns = await assertDomainOwnership(req.params.domainId, req.userId);
    if (!owns) return res.status(404).json({ error: "Domain not found" });

    const { type, name, value, ttl, priority } = req.body;
    if (type && !VALID_TYPES.includes(type.toUpperCase())) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const result = await pool.query(
      `UPDATE dns_records SET
         type = COALESCE($1, type),
         name = COALESCE($2, name),
         value = COALESCE($3, value),
         ttl = COALESCE($4, ttl),
         priority = COALESCE($5, priority)
       WHERE id = $6 AND domain_id = $7
       RETURNING *`,
      [type ? type.toUpperCase() : null, name, value, ttl, priority, req.params.recordId, req.params.domainId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
    res.json({ record: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

// DELETE /api/domains/:domainId/records/:recordId
router.delete("/:domainId/records/:recordId", async (req, res) => {
  try {
    const owns = await assertDomainOwnership(req.params.domainId, req.userId);
    if (!owns) return res.status(404).json({ error: "Domain not found" });

    const result = await pool.query(
      "DELETE FROM dns_records WHERE id = $1 AND domain_id = $2 RETURNING id",
      [req.params.recordId, req.params.domainId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

module.exports = router;
