-- ============================================================
-- PROYECTO FINAL: TIENDA DE CROCHET (INF-312)
-- DDL: CREACIÓN DE TABLAS EN POSTGRESQL
-- ============================================================

-- Borrar tablas previas en orden inverso para limpiar la BD limpia
DROP TABLE IF EXISTS Detalle_Pedido CASCADE;
DROP TABLE IF EXISTS Pago CASCADE;
DROP TABLE IF EXISTS Metodo_De_Pago CASCADE;
DROP TABLE IF EXISTS Pedido CASCADE;
DROP TABLE IF EXISTS Producto CASCADE;
DROP TABLE IF EXISTS Cliente CASCADE;

-- 1. Tabla CLIENTE
CREATE TABLE Cliente (
    celular VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    CONSTRAINT PK_Cliente PRIMARY KEY (celular)
);

-- 2. Tabla PRODUCTO (Mapeado de tus peluches de la web)
CREATE TABLE Producto (
    id_producto SERIAL NOT NULL, -- SERIAL genera números automáticos en Postgres
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    CONSTRAINT PK_Producto PRIMARY KEY (id_producto),
    CONSTRAINT CHK_Precio_Positivo CHECK (precio >= 0)
);

-- 3. Tabla PEDIDO
CREATE TABLE Pedido (
    id_pedido SERIAL NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    celular_cliente VARCHAR(20) NOT NULL,
    CONSTRAINT PK_Pedido PRIMARY KEY (id_pedido),
    CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (celular_cliente) 
        REFERENCES Cliente(celular) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 4. Tabla MÉTODO DE PAGO
CREATE TABLE Metodo_De_Pago (
    id_metodo SERIAL NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    CONSTRAINT PK_Metodo_Pago PRIMARY KEY (id_metodo),
    CONSTRAINT CHK_Tipo_Pago CHECK (tipo IN ('QR', 'Efectivo', 'Transferencia'))
);

-- 5. Tabla PAGO
CREATE TABLE Pago (
    id_pago SERIAL NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_pago VARCHAR(30) NOT NULL,
    id_pedido INT NOT NULL,
    id_metodo INT NOT NULL,
    CONSTRAINT PK_Pago PRIMARY KEY (id_pago),
    CONSTRAINT CHK_Monto_Positivo CHECK (monto > 0),
    CONSTRAINT FK_Pago_Pedido FOREIGN KEY (id_pedido) 
        REFERENCES Pedido(id_pedido) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT FK_Pago_Metodo FOREIGN KEY (id_metodo) 
        REFERENCES Metodo_De_Pago(id_metodo) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- 6. Tabla DETALLE PEDIDO
CREATE TABLE Detalle_Pedido (
    id_detalle SERIAL NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    CONSTRAINT PK_Detalle_Pedido PRIMARY KEY (id_detalle),
    CONSTRAINT CHK_Cantidad_Valida CHECK (cantidad > 0),
    CONSTRAINT CHK_Subtotal_Valida CHECK (subtotal >= 0),
    CONSTRAINT FK_Detalle_Pedido FOREIGN KEY (id_pedido) 
        REFERENCES Pedido(id_pedido) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT FK_Detalle_Producto FOREIGN KEY (id_producto) 
        REFERENCES Producto(id_producto) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);
