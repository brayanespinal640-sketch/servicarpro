-- DDL Base de Datos ServicarPro - Sprint 1
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT REFERENCES roles(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    vehiculo_id INT REFERENCES vehiculos(id),
    fecha_hora TIMESTAMP NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(30) DEFAULT 'PROGRAMADA'
);

CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT REFERENCES vehiculos(id),
    cita_id INT REFERENCES citas(id),
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnostico TEXT,
    estado VARCHAR(30) DEFAULT 'ABIERTA'
);

CREATE TABLE IF NOT EXISTS repuestos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    costo NUMERIC(10,2) NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5
);

CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL,
    impuesto NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'PENDIENTE'
);

-- DATOS DE PRUEBA (SEED)
INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN', 'Administrador del sistema'),
('RECEPCION', 'Atención a clientes y citas'),
('MECANICO', 'Técnico de taller');

INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion) VALUES 
('Carlos', 'Pérez', '99887766', 'carlos@example.com', 'Tegucigalpa'),
('Maria', 'Rodríguez', '33221100', 'maria@example.com', 'Tegucigalpa');

INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio, color) VALUES 
(1, 'HAB-1234', 'Toyota', 'Corolla', 2018, 'Gris'),
(2, 'PDE-5678', 'Honda', 'Civic', 2020, 'Negro');