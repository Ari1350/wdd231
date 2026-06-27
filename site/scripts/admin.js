document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");
    const tablaHistorial = document.getElementById("tablaHistorial");

    // Almacén maestro unificado en la memoria interna del navegador
    let historialGlobal = JSON.parse(localStorage.getItem("historial_completo_crochet")) || [];

    // Obtener la fecha actual en formato Año-Mes-Día
    const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];

    // 1. RENDERIZAR TABLA OPERATIVA: Muestra solo los pedidos que siguen "Pendiente"
    function renderTablaOperativa() {
        if (!tablaPedidos) return; // Si no estamos en pedidos.html, detiene la función
        tablaPedidos.innerHTML = "";

        const pendientes = historialGlobal.filter(p => p.estadoEntrega === "Pendiente");

        if (pendientes.length === 0) {
            tablaPedidos.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#1b4d2e; font-style:italic;">No existen entregas en curso en este momento.</td></tr>`;
            return;
        }

        pendientes.forEach((pedido) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";

            // Encontrar el índice real en el arreglo global mapeado por su ID único
            const globalIndex = historialGlobal.findIndex(g => g.id === pedido.id);

            tr.innerHTML = `
                <td style="padding: 12px;">${pedido.fechaCompra}</td>
                <td style="padding: 12px;"><strong>${pedido.cliente}</strong><br><small style="color:#666;">Cel: ${pedido.celular}</small></td>
                <td style="padding: 12px;">${pedido.producto} (x${pedido.cantidad})</td>
                <td style="padding: 12px; font-weight: bold;">Bs. ${pedido.subtotal.toFixed(2)}</td>
                <td style="padding: 12px;"><span style="color:#b07d00; font-weight:bold;">${pedido.estadoPago}</span> / <span style="color:#666;">${pedido.estadoEntrega}</span></td>
                <td style="padding: 12px; text-align: center;">
                    <button class="done-btn" data-index="${globalIndex}" style="padding: 5px 10px; background-color: #1b4d2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right:5px; font-family: inherit;">✅ Entregado</button>
                    <button class="cancel-btn" data-index="${globalIndex}" style="padding: 5px 10px; background-color: #c5221f; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: inherit;">❌ Cancelar</button>
                </td>
            `;
            tablaPedidos.appendChild(tr);
        });

        // Configuración de las acciones en los botones operativos de la grilla
        document.querySelectorAll(".done-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.getAttribute("data-index");
                historialGlobal[idx].estadoEntrega = "Entregado";
                historialGlobal[idx].estadoPago = "Completado"; // Al entregarse, se marca como pagado
                historialGlobal[idx].fechaEntrega = obtenerFechaHoy(); // Fecha automática
                guardarYRefrescar();
            });
        });

        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.getAttribute("data-index");
                historialGlobal[idx].estadoEntrega = "Cliente canceló el pedido";
                historialGlobal[idx].fechaEntrega = "-";
                guardarYRefrescar();
            });
        });
    }

    // 2. RENDERIZAR HISTORIAL COMPLETO: Muestra el balance inalterable del mes
    function renderTablaHistorial() {
        if (!tablaHistorial) return; // Si no estamos en historial.html, detiene la función
        tablaHistorial.innerHTML = "";

        if (historialGlobal.length === 0) {
            tablaHistorial.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#666;">El historial de balances está vacío.</td></tr>`;
            return;
        }

        historialGlobal.forEach((pedido) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";
            
            let colorEntrega = pedido.estadoEntrega === "Entregado" ? "#137333" : (pedido.estadoEntrega === "Pendiente" ? "#b07d00" : "#c5221f");
            let colorPago = pedido.estadoPago === "Completado" ? "#137333" : (pedido.estadoPago === "Pendiente" ? "#b07d00" : "#c5221f");

            tr.innerHTML = `
                <td style="padding: 12px;">${pedido.fechaCompra}</td>
                <td style="padding: 12px; font-weight: bold;">${pedido.fechaEntrega}</td>
                <td style="padding: 12px;"><strong>${pedido.cliente}</strong><br><small style="color:#666;">${pedido.direccion}</small></td>
                <td style="padding: 12px;">${pedido.producto} (x${pedido.cantidad})</td>
                <td style="padding: 12px; font-weight: bold;">Bs. ${pedido.subtotal.toFixed(2)}</td>
                <td style="padding: 12px; font-weight: bold; color: ${colorPago};">${pedido.estadoPago}</td>
                <td style="padding: 12px; font-weight: bold; color: ${colorEntrega};">${pedido.estadoEntrega}</td>
            `;
            tablaHistorial.appendChild(tr);
        });
    }

    // Guardar en LocalStorage y redibujar las grillas operativas
    function guardarYRefrescar() {
        localStorage.setItem("historial_completo_crochet", JSON.stringify(historialGlobal));
        renderTablaOperativa();
        renderTablaHistorial();
    }

    // 3. CAPTURA Y PROCESAMIENTO DEL FORMULARIO CON CÁLCULOS AUTOMÁTICOS
    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const selectProducto = document.getElementById("productoSelect");
            const precioUnitario = parseFloat(selectProducto.options[selectProducto.selectedIndex].dataset.precio);
            const cantidadUnidades = parseInt(document.getElementById("txtCantidad").value);

            const nuevoRegistroMaestro = {
                id: Date.now() + Math.random(),
                cliente: document.getElementById("clienteName").value,
                celular: document.getElementById("clienteCelular").value,       // Nuevo atributo de tabla CLIENTE
                direccion: document.getElementById("clienteDireccion").value,   // Nuevo atributo de tabla CLIENTE
                producto: selectProducto.value,
                cantidad: cantidadUnidades,
                subtotal: precioUnitario * cantidadUnidades, // Multiplicación matemática automatizada
                metodo: document.getElementById("metodoPago").value,
                estadoPago: document.getElementById("estadoPago").value,
                estadoEntrega: document.getElementById("estadoEntrega").value,
                fechaCompra: obtenerFechaHoy(), // Captura automática de fecha
                fechaEntrega: document.getElementById("estadoEntrega").value === "Entregado" ? obtenerFechaHoy() : "-"
            };

            historialGlobal.push(nuevoRegistroMaestro);
            guardarYRefrescar();
            adminForm.reset();
            alert("🔄 [Sincronización Simulada] Registro cargado en el sistema operativo.");
        });
    }

    // Inicialización automática al cargar las páginas
    renderTablaOperativa();
    renderTablaHistorial();
});
