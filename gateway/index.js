const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_GATEWAY || 8000;

app.use(cors());
app.use(express.json());

// Endpoint de salud del API Gateway
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'API Gateway',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway ejecutándose en el puerto ${PORT}`);
});