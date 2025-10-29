const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const materialsRouter = require('./routes/materials');
const purchasesRouter = require('./routes/purchases');
const salesRouter = require('./routes/sales');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req,res)=> res.json({ok:true}));

app.use('/api/materials', materialsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));

