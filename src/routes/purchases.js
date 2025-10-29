const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { invoice_no, supplier_id, date, items } = req.body;
    const total = items.reduce((s,i)=>s + parseFloat(i.line_total),0);
    const tax = items.reduce((s,i)=> s + (parseFloat(i.line_total) - (parseFloat(i.qty)*parseFloat(i.unit_price))),0);

    const r = await client.query(
      `INSERT INTO purchases (invoice_no,supplier_id,date,total_amount,tax_amount) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [invoice_no, supplier_id, date || new Date(), total, tax]
    );
    const purchaseId = r.rows[0].id;

    for (const it of items) {
      await client.query(
        `INSERT INTO purchase_items (purchase_id,material_id,batch_no,qty,unit_price,tax_percent,line_total)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [purchaseId, it.material_id, it.batch_no || null, it.qty, it.unit_price, it.tax_percent || 0, it.line_total]
      );
      await client.query(`INSERT INTO stock_movements (material_id,change,ref_type,ref_id,note)
                          VALUES($1,$2,$3,$4,$5)`, [it.material_id, parseFloat(it.qty), 'PURCHASE', purchaseId, invoice_no]);
    }

    await client.query('COMMIT');
    res.json({ success: true, purchase: r.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

