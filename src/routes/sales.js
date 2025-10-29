const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');

// Google Drive helper
function getDriveClient() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || '';
  if (!b64) return null;
  const keyJson = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  const jwtClient = new google.auth.JWT(
    keyJson.client_email,
    null,
    keyJson.private_key,
    ['https://www.googleapis.com/auth/drive.file']
  );
  return google.drive({ version: 'v3', auth: jwtClient });
}

async function uploadBufferToDrive(buffer, filename) {
  const drive = getDriveClient();
  if (!drive) return null;
  const auth = drive.auth;
  await auth.authorize();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
  const fileMetadata = { name: filename };
  if (folderId) fileMetadata.parents = [folderId];
  const stream = require('stream');
  const readable = new stream.PassThrough();
  readable.end(buffer);
  const res = await drive.files.create({
    resource: fileMetadata,
    media: { mimeType: 'application/pdf', body: readable },
    fields: 'id, webViewLink, webContentLink'
  });
  return res.data;
}

router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { invoice_no, customer_id, date, items } = req.body;
    const total = items.reduce((s,i)=>s + parseFloat(i.line_total),0);
    const tax = items.reduce((s,i)=> s + (parseFloat(i.line_total) - (parseFloat(i.qty)*parseFloat(i.unit_price))),0);

    for (const it of items) {
      const q = await client.query('SELECT COALESCE(SUM(change),0) as stock FROM stock_movements WHERE material_id=$1', [it.material_id]);
      const stock = parseFloat(q.rows[0].stock || 0);
      if (stock < parseFloat(it.qty)) throw new Error(`Not enough stock for ${it.material_id}`);
    }

    const r = await client.query(
      `INSERT INTO sales (invoice_no,customer_id,date,total_amount,tax_amount)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [invoice_no, customer_id, date || new Date(), total, tax]
    );
    const saleId = r.rows[0].id;

    for (const it of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id,material_id,qty,unit_price,tax_percent,line_total)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [saleId, it.material_id, it.qty, it.unit_price, it.tax_percent || 0, it.line_total]
      );
      await client.query(`INSERT INTO stock_movements (material_id,change,ref_type,ref_id,note)
                          VALUES($1,$2,$3,$4,$5)`,
                          [it.material_id, -parseFloat(it.qty), 'SALE', saleId, invoice_no]);
    }

    await client.query('COMMIT');

    // Create PDF invoice
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      const fileName = `invoice-${invoice_no || uuidv4()}.pdf`;
      try {
        const uploaded = await uploadBufferToDrive(pdfData, fileName);
        res.json({ success: true, sale: r.rows[0], drive: uploaded });
      } catch (err) {
        res.json({ success: true, sale: r.rows[0], drive_error: err.message });
      }
    });

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.text(`Invoice No: ${invoice_no}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    items.forEach((it, i) => {
      doc.text(`${i+1}. Material: ${it.material_id} | Qty: ${it.qty} | Rate: ${it.unit_price} | Total: ${it.line_total}`);
    });
    doc.moveDown();
    doc.text(`Grand Total: ${total.toFixed(2)}`);
    doc.end();

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

