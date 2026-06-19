-- ============================================================
-- PROYECTO FINAL: TIENDA DE CROCHET (INF-312)
-- DML: INSERCIÓN DE DATOS DE PRUEBA (CATÁLOGO REAL)
-- ============================================================

-- Limpiar la tabla antes de insertar por si acaso
TRUNCATE TABLE Producto CASCADE;

-- Insertar los 15 productos con los mismos precios y nombres de la web
INSERT INTO Producto (nombre, precio) VALUES
('Crochet Cow (Vaca)', 45.00),
('Crochet Chick (Pollito)', 25.00),
('Crochet Bee (Abeja)', 30.00),
('Crochet Capybara (Carpincho)', 50.00),
('Crochet Sunflowers (Girasoles)', 35.00),
('Crochet Roses (Rosas)', 40.00),
('Crochet Tulips (Tulipanes)', 35.00),
('Crochet Bunny (Conejo)', 45.00),
('Crochet Bear (Oso)', 45.00),
('Crochet Elephant (Elefante)', 55.00),
('Crochet Dog (Perro)', 50.00),
('Crochet Cat (Gato)', 50.00),
('Crochet Duck (Pato)', 25.00),
('Crochet Panda (Panda)', 55.00),
('Crochet Koala (Koala)', 55.00);

-- ============================================================
-- DATOS EXTRA DE PRUEBA PARA SIMULAR UN PEDIDO REAL
-- ============================================================

-- 1. Insertar Métodos de Pago válidos según el CHECK
INSERT INTO Metodo_De_Pago (tipo) VALUES 
('QR'), 
('Efectivo'), 
('Transferencia');

-- 2. Insertar un Cliente de prueba (por ejemplo, con celular de Santa Cruz)
INSERT INTO Cliente (celular, nombre, direccion) VALUES 
('71020304', 'Juan Pérez', 'Av. Bush, 2do Anillo, Santa Cruz');

-- 3. Crear un Pedido para ese cliente
INSERT INTO Pedido (celular_cliente) VALUES 
('71020304'); -- Se genera automáticamente el id_pedido = 1

-- 4. Agregar el Detalle del Pedido (Compró 1 Carpincho y 2 Abejitas)
INSERT INTO Detalle_Pedido (precio_unitario, cantidad, subtotal, id_pedido, id_producto) VALUES 
(50.00, 1, 50.00, 1, 4),  -- 1 Carpincho (ID 4)
(30.00, 2, 60.00, 1, 3);  -- 2 Abejitas (ID 3)

-- 5. Registrar el Pago del Pedido (Total Bs. 110.00 por QR)
INSERT INTO Pago (monto, estado_pago, id_pedido, id_metodo) VALUES 
(110.00, 'Completado', 1, 1); -- ID 1 es 'QR'
