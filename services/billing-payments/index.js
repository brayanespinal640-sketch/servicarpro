const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_CUSTOMERS || 3001;

app.use(cors());
app.use(express.json());

// Endpoint de salud obligatorio para el Sprint 1
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'MS-03: Billing and Payments Service',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Microservicio de Facturación y Pagos en puerto ${PORT}`);
});