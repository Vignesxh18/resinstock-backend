const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const r = await db.query('SELECT * FROM materials ORDER BY id');
  res.json(r.rows);
});

router.post('/', async (req, res) => {
  const { code, name, unit, hsn_code, gst_percent } = req.body;
  const r = await db.query(
    `INSERT INTO materials (code,name,unit,hsn_code,gst_percent) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [code,name,unit,hsn_code,gst_percent]
  );
  res.json(r.rows[0]);
});

module.exports = router;

