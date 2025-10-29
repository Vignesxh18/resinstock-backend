CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  hsn_code VARCHAR(50),
  gst_percent NUMERIC(5,2) DEFAULT 18.00,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT
);

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  invoice_no VARCHAR(100) UNIQUE,
  supplier_id INT REFERENCES suppliers(id),
  date DATE DEFAULT CURRENT_DATE,
  total_amount NUMERIC(14,2),
  tax_amount NUMERIC(14,2),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INT REFERENCES purchases(id) ON DELETE CASCADE,
  material_id INT REFERENCES materials(id),
  batch_no VARCHAR(100),
  qty NUMERIC(14,3),
  unit_price NUMERIC(14,4),
  tax_percent NUMERIC(5,2),
  line_total NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  invoice_no VARCHAR(100) UNIQUE,
  customer_id INT REFERENCES customers(id),
  date DATE DEFAULT CURRENT_DATE,
  total_amount NUMERIC(14,2),
  tax_amount NUMERIC(14,2),
  status VARCHAR(20) DEFAULT 'UNPAID',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
  material_id INT REFERENCES materials(id),
  qty NUMERIC(14,3),
  unit_price NUMERIC(14,4),
  tax_percent NUMERIC(5,2),
  line_total NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  ref_type VARCHAR(10) NOT NULL,
  ref_id INT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  mode VARCHAR(50),
  txn_no VARCHAR(200),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  material_id INT REFERENCES materials(id),
  change NUMERIC(14,3) NOT NULL,
  ref_type VARCHAR(20),
  ref_id INT,
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

