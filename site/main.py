import oracledb
import sys

DB_USER = "ARIASPERALTAG_SCHEMA_5OJMV"
DB_PASSWORD = "YH2!JY2KDU3HAMErIF064N4HXW7IAQ"
DB_HOST = "db.freesql.com"
DB_PORT = "2484" 
DB_SERVICE = "23ai_34ui2"

def conectar_oracle():
    try:
        # Establece la conexión transaccional real a través de internet
        conexion = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=f"{DB_HOST}:{DB_PORT}/{DB_SERVICE}"
        )
        return conexion
    except Exception as e:
        print(f"❌ Error crítico de conexión a la nube de FreeSQL: {e}")
        return None

def registrar_pago_en_vivo():
    conn = conectar_oracle()
    if not conn: return
    
    cursor = conn.cursor()
    print("\n📦 --- SISTEMA ADMINISTRATIVO: REGISTRAR NUEVO PAGO ---")
    
    # Captura de datos interactiva (Los atributos de tu Diagrama de 6 Tablas)
    monto = float(input("Ingrese el Monto total de la venta (Bs.): "))
    estado = input("Estado de la Transacción ('Pendiente' o 'Completado'): ")
    id_pedido = int(input("Número de Pedido de referencia: "))
    id_metodo = int(input("ID del Método de Pago (1: QR, 2: Efectivo, 3: Transf.): "))
    
    try:
        # Sentencia DML limpia que viaja por internet
        query = """
            INSERT INTO PAGO (monto, estado_pago, id_pedido, id_metodo) 
            VALUES (:1, :2, :3, :4)
        """
        cursor.execute(query, (monto, estado, id_pedido, id_metodo))
        conn.commit() # Fuerza la persistencia física permanente en la nube
        print("🚀 ¡Sincronización Exitosa! Fila insertada en tu servidor en la nube.")
    except Exception as e:
        print(f"❌ Error de inserción en Oracle: {e}")
    finally:
        cursor.close()
        conn.close()

def visualizar_grilla_reportes():
    conn = conectar_oracle()
    if not conn: return
    
    cursor = conn.cursor()
    print("\n📊 --- REPORTES EN GRILLA EN VIVO (DESDE ORACLE CLOUD) ---")
    print("-" * 80)
    print(f"{'ID PAGO':<10}{'MONTO (Bs)':<15}{'FECHA':<15}{'ESTADO':<15}{'PEDIDO':<10}")
    print("-" * 80)
    
    try:
        # Consulta SELECT que extrae las tuplas físicas de internet
        cursor.execute("SELECT id_pago, monto, TO_CHAR(fecha_pago, 'YYYY-MM-DD'), estado_pago, id_pedido FROM PAGO")
        for fila in cursor.fetchall():
            print(f"{fila[0]:<10}{fila[1]:<15}{fila[2]:<15}{fila[3]:<15}{fila[4]:<10}")
    except Exception as e:
        print(f"❌ Error al consultar la grilla: {e}")
    finally:
        cursor.close()
        conn.close()

def menu_principal():
    while True:
        print("\n====================================================")
        print(" 🛠️ INTERFAZ DE ESCRITORIO CONTROLADORA — CROCHET ")
        print("====================================================")
        print("1. Registrar venta / Pago en vivo (Insert DML)")
        print("2. Visualizar reporte en Grilla desde la Nube (Select)")
        print("3. Salir del Sistema")
        
        opcion = input("\nSeleccione una opción operativa (1-3): ")
        if opcion == "1":
            registrar_pago_en_vivo()
        elif opcion == "2":
            visualizar_grilla_reportes()
        elif opcion == "3":
            print("Cerrando sesión en los servidores de Oracle. ¡Adiós!")
            sys.exit()
        else:
            print("⚠ Opción inválida. Intente de nuevo.")

if __name__ == "__main__":
    menu_principal()
