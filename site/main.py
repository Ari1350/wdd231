import sqlite3
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- CONFIGURACIÓN INICIAL ---
app = Flask(__name__)
CORS(app) # Permite que tu web se conecte al servidor sin bloqueos
DB_NAME = "ventas_crochet.db"

# --- 1. GESTIÓN DE LA BASE DE DATOS (Nivel Interno) ---

def conectar_sqlite():
    """Establece conexión con el archivo local de SQLite."""
    try:
        return sqlite3.connect(DB_NAME)
    except Exception as e:
        print(f"❌ Error al acceder a la base de datos: {e}")
        return None

def inicializar_sistema():
    """Crea las 6 tablas con soporte para imágenes y descripciones (DDL)."""
    conn = conectar_sqlite()
    if not conn: return
    cursor = conn.cursor()
    try:
        # Script DDL actualizado (Unidad IV)
        cursor.executescript("""
            CREATE TABLE IF NOT EXISTS Cliente (
                id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT NOT NULL,
                Celular TEXT,
                Direccion TEXT
            );

            -- Tabla Producto actualizada con nuevas columnas
            CREATE TABLE IF NOT EXISTS Producto (
                id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT NOT NULL,
                Precio DECIMAL(10,2) NOT NULL,
                Imagen TEXT,        -- Nueva columna para la ruta de la foto
                Descripcion TEXT    -- Nueva columna para el detalle del peluche
            );

            CREATE TABLE IF NOT EXISTS Pedido (
                ID_Pedido INTEGER PRIMARY KEY AUTOINCREMENT,
                Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                id_cliente INTEGER,
                FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
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
                estado_pago TEXT CHECK(estado_pago IN ('Pendiente', 'Completado')),
                id_pedido INTEGER,
                id_metodo INTEGER,
                FOREIGN KEY (id_pedido) REFERENCES Pedido(ID_Pedido),
                FOREIGN KEY (id_metodo) REFERENCES Metodo_Pago(id_metodo)
            );

            -- Inserción de datos iniciales con imágenes y descripciones reales (DML)
            INSERT OR IGNORE INTO Metodo_Pago (id_metodo, Tipo) VALUES (1, 'QR'), (2, 'Efectivo'), (3, 'Transferencia');
            
            -- Ejemplo de carga de tus peluches reales
            INSERT OR IGNORE INTO Producto (Nombre, Precio, Imagen, Descripcion) VALUES 
            ('Vaquita de Crochet', 45.00, 'images/cow.webp', 'Una tierna vaquita hecha a mano con hilo de algodón premium.'),
            ('Pollito de Crochet', 25.00, 'images/chick.webp', 'Pequeño y suave pollito ideal para regalo o llavero.'),
            ('Abejita de Crochet', 30.00, 'images/bee.webp', 'Abejita laboriosa con detalles en negro y amarillo brillante.');
        """)
        conn.commit()
        print("✅ Base de Datos actualizada con éxito.")
    except Exception as e:
        print(f"❌ Error al actualizar el DDL: {e}")
    finally:
        conn.close()

# --- 2. RUTAS PARA LA WEB (Nivel Conceptual / API) ---

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

@app.route('/guardar_pago', methods=['POST'])
def guardar_pago():
    """Recibe un pago desde el formulario de la web y lo guarda."""
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

# --- 3. EJECUCIÓN DEL SERVIDOR ---

if __name__ == "__main__":
    # Primero preparamos las tablas
    inicializar_sistema()
    # Luego encendemos el servidor para la web
    print("\n" + "="*50)
    print("🚀 SERVIDOR ACTIVO EN: http://127.0.0.1:5000")
    print("Presiona CTRL+C para detenerlo")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)

# RUTA PARA CONTACTO (Registrar Cliente)
@app.route('/registrar_cliente', methods=['POST'])
def registrar_cliente():
    datos = request.json
    try:
        with conectar_sqlite() as conn:
            cursor = conn.cursor()
            # Insertamos en la tabla Cliente según tu diagrama [4]
            query = "INSERT INTO Cliente (Nombre, Celular, Direccion) VALUES (?, ?, ?)"
            cursor.execute(query, (datos['nombre'], datos['celular'], datos['direccion']))
            conn.commit()
        return jsonify({"mensaje": "✅ Cliente anotado correctamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# RUTA PARA PEDIDOS
@app.route('/registrar_pedido', methods=['POST'])
def registrar_pedido():
    datos = request.json
    try:
        with conectar_sqlite() as conn:
            cursor = conn.cursor()
            # Registramos el pedido vinculado a un cliente [4]
            query = "INSERT INTO Pedido (id_cliente) VALUES (?)"
            cursor.execute(query, (datos['id_cliente'],))
            conn.commit()
        return jsonify({"mensaje": "🚀 Pedido generado en la base de datos"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
# RUTA PARA DETALLE DE PEDIDO

@app.route('/obtener_historial', methods=['GET'])
def obtener_historial():
    try:
        with conectar_sqlite() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            # Consulta DML con JOIN para unir Cliente y Pago (Unidad IV)
            query = """
                    SELECT 
                        C.Nombre AS cliente, 
                        P.monto AS subtotal, 
                        P.fecha_pago AS fechaCompra,
                        C.direccion AS direccion,
                        'Vaquita de Crochet' AS producto, 
                        1 AS cantidad,
                        P.fecha_pago AS fechaEntrega,
                        P.estado_pago AS estadoPago,
                        'Entregado' AS estadoEntrega
                    FROM Cliente C
                    JOIN Pedido Pe ON C.id_cliente = Pe.id_cliente
                    JOIN Pago P ON Pe.ID_Pedido = P.id_pedido
                """
            cursor.execute(query)
            historial = [dict(row) for row in cursor.fetchall()]
        return jsonify(historial), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500