const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { ref_type, ref_id, amount, mode, txn_no, date } = req.body;
  const r = await db.query(
    `INSERT INTO payments (ref_type,ref_id,amount,mode,txn_no,date)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [ref_type, ref_id, amount, mode, txn_no, date || new Date()]
  );
  res.json(r.rows[0]);
});

module.exports = router;

