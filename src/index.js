const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const materialsRouter = require('./routes/materials');
const purchasesRouter = require('./routes/purchases');
const salesRouter = require('./routes/sales');
const paymentsRouter = require('./routes/payments');

const app = express();

// ✅ CORS fix for Hoppscotch, Render, and any frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ ResinStock Backend is running successfully');
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/materials', materialsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('✅ Backend running on port', PORT));
