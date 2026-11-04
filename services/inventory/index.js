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

// Endpoint de Salud
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'MS-03: Inventario y Proveedores', timestamp: new Date() });
});

// 1. Obtener Repuestos
app.get('/api/v1/inventory/parts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.nombre as proveedor_nombre
      FROM repuestos r
      LEFT JOIN proveedores p ON r.proveedor_id = p.id
      ORDER BY r.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Registrar Nuevo Repuesto
app.post('/api/v1/inventory/parts', async (req, res) => {
  const { proveedor_id, codigo, nombre, costo, precio_venta, stock_actual, stock_minimo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO repuestos (proveedor_id, codigo, nombre, costo, precio_venta, stock_actual, stock_minimo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [proveedor_id, codigo, nombre, costo, precio_venta, stock_actual || 0, stock_minimo || 5]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Registrar Movimiento de Stock (ENTRADA / SALIDA) y actualizar stock_actual
app.post('/api/v1/inventory/movements', async (req, res) => {
  const { repuesto_id, tipo, cantidad, referencia } = req.body;
  
  if (!['ENTRADA', 'SALIDA', 'AJUSTE'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo de movimiento inválido' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insertar registro en movimientos_inventario
    await client.query(
      'INSERT INTO movimientos_inventario (repuesto_id, tipo, cantidad, referencia) VALUES ($1, $2, $3, $4)',
      [repuesto_id, tipo, cantidad, referencia]
    );

    // Actualizar existencia en la tabla repuestos
    const operacion = tipo === 'ENTRADA' ? '+' : '-';
    const updateResult = await client.query(
      UPDATE repuestos SET stock_actual = stock_actual ${operacion} $1 WHERE id = $2 RETURNING *,
      [cantidad, repuesto_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Movimiento registrado con éxito', data: updateResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// 4. Obtener Proveedores
app.get('/api/v1/inventory/suppliers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores WHERE activo = true ORDER BY nombre ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(Microservicio de Inventario ejecutándose en puerto ${PORT});
});
