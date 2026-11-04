const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_CUSTOMERS || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'servicarpro_secret_key_2026';

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
  res.json({ status: 'UP', service: 'MS-01: Clientes y Vehículos', timestamp: new Date() });
});

// --- AUTENTICACIÓN DEMO ---
app.post('/api/v1/auth/login', async (req, res) => {
  const { correo, password } = req.body;
  // Simulación de login para pruebas del Sprint 2
  if (correo === 'admin@servicarpro.com' && password === 'admin123') {
    const token = jwt.sign({ id: 1, nombre: 'Admin ServicarPro', rol: 'ADMIN' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token, user: { nombre: 'Admin ServicarPro', correo, rol: 'ADMIN' } });
  }
  return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
});

// --- CLIENTES (CRUD) ---
// Obtener todos los clientes
app.get('/api/v1/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Crear cliente
app.post('/api/v1/customers', async (req, res) => {
  const { nombres, apellidos, telefono, correo, direccion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombres, apellidos, telefono, correo, direccion]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- VEHÍCULOS ---
// Obtener vehículos con datos de su dueño
app.get('/api/v1/vehicles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, CONCAT(c.nombres, ' ', c.apellidos) as cliente_nombre
      FROM vehiculos v
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Registrar vehículo a un cliente
app.post('/api/v1/vehicles', async (req, res) => {
  const { cliente_id, placa, marca, modelo, anio, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [cliente_id, placa, marca, modelo, anio, color]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio de Clientes y Vehículos ejecutándose en puerto ${PORT}`);
});