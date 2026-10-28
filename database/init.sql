
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

-- 2. TABLAS DE CLIENTES Y VEHÍCULOS
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
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30)
);

-- 3. TABLAS DE OPERACIONES DEL TALLER
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

CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orden_servicios (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    servicio_id INT REFERENCES servicios(id),
    cantidad INT DEFAULT 1,
    precio_aplicado NUMERIC(10,2) NOT NULL
);

-- 4. TABLAS DE INVENTARIO Y PROVEEDORES (RESPONSABILIDAD DE JAIME)
CREATE TABLE IF NOT EXISTS proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS repuestos (
    id SERIAL PRIMARY KEY,
    proveedor_id INT REFERENCES proveedores(id),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    costo NUMERIC(10,2) NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id SERIAL PRIMARY KEY,
    repuesto_id INT REFERENCES repuestos(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referencia VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS orden_repuestos (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    repuesto_id INT REFERENCES repuestos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_aplicado NUMERIC(10,2) NOT NULL
);

-- 5. TABLAS DE FACTURACIÓN Y PAGOS
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES ordenes_trabajo(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL,
    impuesto NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'PENDIENTE'
);

CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    factura_id INT REFERENCES facturas(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    importe NUMERIC(10,2) NOT NULL CHECK (importe > 0),
    metodo VARCHAR(30) NOT NULL,
    referencia VARCHAR(100)
);


INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN', 'Administrador General del Sistema'),
('RECEPCION', 'Atención a clientes, citas y apertura de órdenes'),
('MECANICO', 'Técnico encargado de diagnósticos y reparaciones'),
('INVENTARIO', 'Encargado de gestión de repuestos y stock'),
('CAJERO', 'Gestión de facturas y cobros');

INSERT INTO clientes (nombres, apellidos, telefono, correo, direccion) VALUES 
('Carlos', 'Pérez', '99887766', 'carlos@example.com', 'Col. Palmira, Tegucigalpa'),
('Maria', 'Rodríguez', '33221100', 'maria@example.com', 'Bo. La Hoya, Tegucigalpa');

INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio, color) VALUES 
(1, 'HAB-1234', 'Toyota', 'Corolla', 2018, 'Gris'),
(2, 'PDE-5678', 'Honda', 'Civic', 2020, 'Negro');

INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES 
('Autopartes del Valle', '22345678', 'ventas@autovalle.hn', 'Tegucigalpa'),
('Importadora Repuestos HN', '25501122', 'contacto@imporhn.com', 'San Pedro Sula');

INSERT INTO repuestos (proveedor_id, codigo, nombre, costo, precio_venta, stock_actual, stock_minimo) VALUES 
(1, 'REP-088', 'Pastillas de Freno Bosch', 500.00, 850.00, 12, 5),
(2, 'REP-102', 'Aceite 10W-30 Sintético', 130.00, 220.00, 2, 10);
