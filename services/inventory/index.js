const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_INVENTORY || 3003;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'servicar_user',
  password: process.env.DB_PASSWORD || 'servicar_pass',
  database: process.env.DB_NAME || 'servicarpro_db',
  port: process.env.DB_PORT || 5432,
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'MS-03: Inventory Service',
    timestamp: new Date()
  });
});

  try {
    const result = await pool.query(`
      SELECT r.id, r.codigo, r.nombre, r.costo, r.precio_venta, r.stock_actual, r.stock_minimo, p.nombre as proveedor
      FROM repuestos r
      LEFT JOIN proveedores p ON r.proveedor_id = p.id
      ORDER BY r.id ASC
    `);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error al consultar repuestos:', error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor de inventario' });
  }
});

app.get('/api/v1/inventory/low-stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT codigo, nombre, stock_actual, stock_minimo 
      FROM repuestos 
      WHERE stock_actual <= stock_minimo
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al consultar stock bajo:', error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor de inventario' });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio de Inventario listo en puerto ${PORT}`);
});
