import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- CONFIGURACIÓN INICIAL ---
app = Flask(__name__)
CORS(app) 
DB_NAME = "ventas_crochet.db"

# --- 1. GESTIÓN DE LA BASE DE DATOS ---

def conectar_sqlite():
    """Establece conexión con el archivo local de SQLite con un timeout de 10 segundos."""
    try:
        # El timeout evita que DBeaver y Flask choquen y se bloqueen mutuamente
        return sqlite3.connect(DB_NAME, timeout=10)
    except Exception as e:
        print(f"❌ Error al acceder a la base de datos: {e}")
        return None

def inicializar_sistema():
    """Crea las 6 tablas con soporte para imágenes, descripciones y todos los estados de pago."""
    conn = conectar_sqlite()
    if not conn: return
    cursor = conn.cursor()
    try:
        cursor.executescript("""
            CREATE TABLE IF NOT EXISTS Cliente (
                id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT NOT NULL,
                Celular TEXT,
                Direccion TEXT
            );

            CREATE TABLE IF NOT EXISTS Producto (
                id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT NOT NULL,
                Precio DECIMAL(10,2) NOT NULL,
                Imagen TEXT,        
                Descripcion TEXT    
            );

            CREATE TABLE IF NOT EXISTS Pedido (
                ID_Pedido INTEGER PRIMARY KEY AUTOINCREMENT,
                Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                estado_entrega TEXT NOT NULL DEFAULT 'Pendiente'
                    CHECK(estado_entrega IN (
                        'Pendiente',
                        'Entregado',
                        'Cancelado'
                    )),
                id_cliente INTEGER NOT NULL,
                FOREIGN KEY (id_cliente)
                    REFERENCES Cliente(id_cliente)
            );

            CREATE TABLE IF NOT EXISTS Detalle_Pedido (
                id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Pedido INTEGER,
                id_producto INTEGER,
                cantidad INTEGER,
                precio_unitario DECIMAL(10,2),
                subtotal DECIMAL(10,2),
                FOREIGN KEY (ID_Pedido) REFERENCES Pedido(ID_Pedido),
                FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
            );

            CREATE TABLE IF NOT EXISTS Metodo_Pago (
                id_metodo INTEGER PRIMARY KEY AUTOINCREMENT,
                Tipo TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Pago (
                id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
                monto DECIMAL(10,2),
                fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
                -- Se añaden todos los estados posibles que pusiste en tus archivos HTML
                estado_pago TEXT CHECK(estado_pago IN ('Pendiente', 'Completado', 'Fallido', 'Cancelado', 'Rechazado')),
                id_pedido INTEGER,
                id_metodo INTEGER,
                FOREIGN KEY (id_pedido) REFERENCES Pedido(ID_Pedido),
                FOREIGN KEY (id_metodo) REFERENCES Metodo_Pago(id_metodo)
            );

            -- Inserción de datos iniciales
            INSERT OR IGNORE INTO Metodo_Pago (id_metodo, Tipo) VALUES (1, 'QR'), (2, 'Efectivo'), (3, 'Transferencia');
            
            INSERT OR IGNORE INTO Producto (id_producto, Nombre, Precio, Imagen, Descripcion) VALUES 
            (1, 'Vaquita de Crochet', 45.00, 'images/cow.webp', 'Una tierna vaquita hecha a mano con hilo de algodón premium.'),
            (2, 'Pollito de Crochet', 25.00, 'images/chick.webp', 'Pequeño y suave pollito ideal para regalo o llavero.'),
            (3, 'Abejita de Crochet', 30.00, 'images/bee.webp', 'Abejita laboriosa con detalles en negro y amarillo brillante.'),
            (4, 'Carpincho de Crochet', 50.00, 'images/capybara.webp', 'Un lindo carpincho de crochet.'),
            (5, 'Girasoles de Crochet', 35.00, 'images/sunflower.webp', 'Girasoles tejidos.');
        """)
        conn.commit()
        print("✅ Base de Datos 'ventas_crochet.db' inicializada y actualizada con éxito.")
    except Exception as e:
        print(f"❌ Error al actualizar el DDL: {e}")
    finally:
        conn.close()

# --- 2. RUTAS PARA LA WEB (Todas declaradas ANTES de encender el servidor) ---

@app.route('/obtener_productos', methods=['GET'])
def obtener_productos():
    """Envía la lista de productos a tu página web."""
    try:
        with conectar_sqlite() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Producto")
            productos = [dict(row) for row in cursor.fetchall()]
        return jsonify(productos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/registrar_cliente', methods=['POST'])
def registrar_cliente():
    """Registra orden completa extrayendo dinámicamente los campos del formulario."""
    datos = request.json
    try:
        with conectar_sqlite() as conn:
            cursor = conn.cursor()
            
            # 1. Insertamos el Cliente real del formulario
            cursor.execute("INSERT INTO Cliente (Nombre, Celular, Direccion) VALUES (?, ?, ?)", 
                           (datos['nombre'], datos['celular'], datos['direccion']))
            id_cliente = cursor.lastrowid
            
            # 2. Creamos el Pedido asociado
            cursor.execute("INSERT INTO Pedido (id_cliente, estado_entrega) VALUES (?, ?)", (id_cliente, "Pendiente"))
            id_pedido = cursor.lastrowid
            
            # 3. Buscamos el precio real del producto seleccionado en la BD
            producto_elegido = datos.get('producto')
            cursor.execute("SELECT id_producto, Precio FROM Producto WHERE Nombre = ?", (producto_elegido,))
            res_prod = cursor.fetchone()
            
            if res_prod:
                id_producto = res_prod[0]
                precio_unitario = float(res_prod[1])
            else:
                # Si el producto no existe en la BD, lo registramos temporalmente con precio base
                cursor.execute("INSERT INTO Producto (Nombre, Precio) VALUES (?, 45.00)", (producto_elegido,))
                id_producto = cursor.lastrowid
                precio_unitario = 45.00
            
            # 4. Capturamos cantidad del formulario y calculamos subtotal
            cantidad = int(datos.get('cantidad', 1))
            subtotal_calculado = precio_unitario * cantidad

            # 5. Insertamos en el Detalle del Pedido
            cursor.execute("""
                INSERT INTO Detalle_Pedido (ID_Pedido, id_producto, cantidad, precio_unitario, subtotal) 
                VALUES (?, ?, ?, ?, ?)
            """, (id_pedido, id_producto, cantidad, precio_unitario, subtotal_calculado))

            # 6. Mapeamos el método de pago a su respectiva ID
            metodos_map = {"QR": 1, "Efectivo": 2, "Transferencia": 3}
            id_metodo = metodos_map.get(datos.get('metodo'), 1)
            
            # 7. Registramos el Pago con el estado seleccionado en el HTML
            cursor.execute("""
                INSERT INTO Pago (monto, estado_pago, id_pedido, id_metodo) 
                VALUES (?, ?, ?, ?)
            """, (subtotal_calculado, datos.get('estadoPago'), id_pedido, id_metodo))
            
            conn.commit()
        return jsonify({"mensaje": "✅ Venta completa sincronizada con éxito"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/registrar_pedido', methods=['POST'])
def registrar_pedido():
    """Genera una orden vinculada a un ID de cliente."""
    datos = request.json
    try:
        with conectar_sqlite() as conn:
            cursor = conn.cursor()
            query = "INSERT INTO Pedido (id_cliente, estado_entrega) VALUES (?, ?)"
            cursor.execute(query, (datos['id_cliente'], "Pendiente"))
            conn.commit()
        return jsonify({"mensaje": "🚀 Pedido generado en la base de datos"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/guardar_pago', methods=['POST'])
def guardar_pago():
    """Guarda un registro de pago financiero."""
    datos = request.json
    try:
        with conectar_sqlite() as conn:
            cursor = conn.cursor()
            query = "INSERT INTO Pago (monto, estado_pago, id_pedido, id_metodo) VALUES (?, ?, ?, ?)"
            cursor.execute(query, (datos['monto'], datos['estado'], datos['id_pedido'], datos['id_metodo']))
            conn.commit()
        return jsonify({"mensaje": "✅ Pago registrado con éxito"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- NUEVA RUTA EXCLUSIVA PARA PEDIDOS.HTML (LISTA DE ENTREGAS) ---
@app.route('/obtener_entregas_pendientes', methods=['GET'])
def obtener_entregas_pendientes():
    """Entrega los datos formateados con llaves explícitas para evitar errores en JavaScript."""
    try:
        with conectar_sqlite() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            query = """
                SELECT 
                    C.Nombre AS cliente, 
                    C.Celular AS celular, 
                    C.Direccion AS direccion,
                    Pr.Nombre AS producto, 
                    DP.cantidad AS cantidad, 
                    P.monto AS subtotal, 
                    P.fecha_pago AS fechaCompra, 
                    P.estado_pago AS estadoPago, 
                    MP.Tipo AS metodo
                FROM Cliente C
                LEFT JOIN Pedido Pe ON C.id_cliente = Pe.id_cliente
                LEFT JOIN Detalle_Pedido DP ON Pe.ID_Pedido = DP.ID_Pedido
                LEFT JOIN Producto Pr ON DP.id_producto = Pr.id_producto
                LEFT JOIN Pago P ON Pe.ID_Pedido = P.id_pedido
                LEFT JOIN Metodo_Pago MP ON P.id_metodo = MP.id_metodo
                WHERE Pe.estado_entrega = 'Pendiente'
            """
            cursor.execute(query)
            return jsonify([dict(row) for row in cursor.fetchall()]), 200
    except Exception as e:
        print("ERROR EN OBTENER_ENTREGAS:", e)
        return jsonify({"error": str(e)}), 500
    
# ---  BOTÓN CANCELAR ---    
@app.route('/cancelar_orden', methods=['POST'])
def cancelar_orden():
    datos = request.get_json()
    cliente = datos.get('cliente')

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Pedido
        SET estado_entrega = 'Cancelado'
        WHERE id_cliente IN (
            SELECT id_cliente
            FROM Cliente
            WHERE Nombre = ?
        )
    """, (cliente,))

    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Orden cancelada"})

# --- NUEVA RUTA EXCLUSIVA PARA HISTORIAL.HTML (BALANCE GENERAL) ---
@app.route('/obtener_historial', methods=['GET'])
def obtener_historial():
    """Trae a tus 10 clientes antiguos y absolutamente todo el balance sin perder registros."""
    try:
        with conectar_sqlite() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            query = """
                SELECT 
                    C.Nombre AS cliente, 
                    COALESCE(C.Celular, 'S/N') AS celular, 
                    COALESCE(C.Direccion, 'WhatsApp') AS direccion,
                    COALESCE(Pr.Nombre, 'Vaquita de Crochet') AS producto, 
                    COALESCE(DP.cantidad, 1) AS cantidad,
                    COALESCE(P.monto, 45.00) AS subtotal, 
                    COALESCE(P.fecha_pago, CURRENT_TIMESTAMP) AS fechaCompra,
                    COALESCE(P.fecha_pago, CURRENT_TIMESTAMP) AS fechaEntrega, 
                    COALESCE(P.estado_pago, 'Completado') AS estadoPago,
                    Pe.estado_entrega AS estadoEntrega
                FROM Cliente C
                LEFT JOIN Pedido Pe ON C.id_cliente = Pe.id_cliente
                LEFT JOIN Detalle_Pedido DP ON Pe.ID_Pedido = DP.ID_Pedido
                LEFT JOIN Producto Pr ON DP.id_producto = Pr.id_producto
                LEFT JOIN Pago P ON Pe.ID_Pedido = P.id_pedido
                ORDER BY P.fecha_pago DESC
            """

            cursor.execute(query)
            historial = [dict(row) for row in cursor.fetchall()]
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NUEVA RUTA PARA EL BOTÓN DE ENTREGADO ---
@app.route('/completar_entrega', methods=['POST'])
def completar_entrega():
    datos = request.get_json()
    cliente = datos.get('cliente')

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Pedido
        SET estado_entrega = 'Entregado'
        WHERE id_cliente IN (
            SELECT id_cliente
            FROM Cliente
            WHERE Nombre = ?
        )
    """, (cliente,))

    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Entrega completada"})

# --- 3. EJECUCIÓN DEL SERVIDOR ---
if __name__ == "__main__":
    inicializar_sistema()
    print("\n" + "="*50)
    print("🚀 SERVIDOR ACTIVO EN: http://127.0.0.1:5000")
    print("Presiona CTRL+C para detenerlo")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)