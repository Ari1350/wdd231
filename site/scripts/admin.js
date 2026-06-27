document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");
    const tablaHistorial = document.getElementById("tablaHistorial");

    let historialGlobal = JSON.parse(localStorage.getItem("historial_completo_crochet")) || [];
    const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];

    function renderTablaOperativa() {
        if (!tablaPedidos) return;
        tablaPedidos.innerHTML = "";
        const pendientes = historialGlobal.filter(p => p.estadoEntrega === "Pendiente");

        if (pendientes.length === 0) {
            tablaPedidos.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#1b4d2e; font-style:italic;">No existen entregas en curso en este momento.</td></tr>`;
            return;
        }

        pendientes.forEach((pedido) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";
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

        document.querySelectorAll(".done-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.getAttribute("data-index");
                historialGlobal[idx].estadoEntrega = "Entregado";
                historialGlobal[idx].estadoPago = "Completado";
                historialGlobal[idx].fechaEntrega = obtenerFechaHoy();
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

    function renderTablaHistorial() {
        if (!tablaHistorial) return;
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

    function guardarYRefrescar() {
        localStorage.setItem("historial_completo_crochet", JSON.stringify(historialGlobal));
        renderTablaOperativa();
        renderTablaHistorial();
    }

    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const selectProducto = document.getElementById("productoSelect");
            const precioUnitario = parseFloat(selectProducto.options[selectProducto.selectedIndex].dataset.precio);
            const cantidadUnidades = parseInt(document.getElementById("txtCantidad").value);

            const nuevoRegistroMaestro = {
                id: Date.now() + Math.random(),
                cliente: document.getElementById("clienteName").value,
                celular: document.getElementById("clienteCelular").value,
                direccion: document.getElementById("clienteDireccion").value,
                producto: selectProducto.value,
                cantidad: cantidadUnidades,
                subtotal: precioUnitario * cantidadUnidades,
                metodo: document.getElementById("metodoPago").value,
                estadoPago: document.getElementById("estadoPago").value,
                estadoEntrega: document.getElementById("estadoEntrega").value,
                fechaCompra: obtenerFechaHoy(),
                fechaEntrega: document.getElementById("estadoEntrega").value === "Entregado" ? obtenerFechaHoy() : "-"
            };

            historialGlobal.push(nuevoRegistroMaestro);
            guardarYRefrescar();
            adminForm.reset();
            alert("✅ [Simulación Completada] Registro guardado de forma visual en las grillas del sistema.");
        });
    }

    renderTablaOperativa();
    renderTablaHistorial();
});

async function guardarContacto() {
    const datos = {
        nombre: document.getElementById('nombre').value,
        celular: document.getElementById('celular').value,
        direccion: document.getElementById('direccion').value
    };

    const respuesta = await fetch('http://127.0.0.1:5000/registrar_cliente', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();
    alert(resultado.mensaje || "Error al guardar");
}