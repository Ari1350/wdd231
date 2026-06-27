document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");
    const tablaHistorial = document.getElementById("tablaHistorial");

    let historialGlobal = [];

    // --- 1. FUNCIÓN PARA LEER DATOS REALES DESDE FLASK ---
        async function cargarHistorialDesdeServidor() {
        try {
            // Si ve la tabla de pedidos usa el canal de pendientes, si no, usa el historial completo
            const rutaAPI = tablaPedidos ? 'http://127.0.0.1:5000/obtener_entregas_pendientes' : 'http://127.0.0.1:5000/obtener_historial';
            
            const res = await fetch(rutaAPI);
            if (!res.ok) throw new Error("Error en la API");
            
            historialGlobal = await res.json();
            
            if (tablaPedidos) renderTablaOperativa();
            if (tablaHistorial) renderTablaHistorial();
        } catch (error) {
            console.error("❌ Error al cargar los datos:", error);
        }
    }

    // --- 2. RENDERIZADO PARA LA TABLA DE ADMIN.HTML ---
function renderTablaOperativa() {
    if (!tablaPedidos) return;
    tablaPedidos.innerHTML = "";

    if (historialGlobal.length === 0) {
        tablaPedidos.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#1b4d2e; font-style:italic;">No existen entregas pendientes en este momento.</td></tr>`;
        return;
    }

    historialGlobal.forEach((pedido, index) => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #C1E1C1";
        tr.innerHTML = `
            <td style="padding: 10px; border: 1px solid #C1E1C1;">${pedido.fechaCompra ? pedido.fechaCompra.split(' ')[0] : 'Hoy'}</td>
            <td style="padding: 10px; border: 1px solid #C1E1C1;"><strong>${pedido.cliente}</strong><br><small style="color:#666;">Cel: ${pedido.celular || 'S/N'}</small></td>
            <td style="padding: 10px; border: 1px solid #C1E1C1;">${pedido.producto} (x${pedido.cantidad || 1})</td>
            <td style="padding: 10px; border: 1px solid #C1E1C1; font-weight: bold;">Bs. ${parseFloat(pedido.subtotal || 0).toFixed(2)}</td>
            <td style="padding: 10px; border: 1px solid #C1E1C1;">${pedido.estadoPago} / ${pedido.metodo || 'QR'}</td>
            <td style="padding: 10px; border: 1px solid #C1E1C1; text-align: center;">
                <button class="done-btn" data-index="${index}" style="padding: 5px 10px; background-color: #1b4d2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 5px;">✅ Entregado</button>
                <button class="cancel-btn" data-index="${index}" style="padding: 5px 10px; background-color: #c5221f; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">❌ Cancelar</button>
            </td>
        `;
        tablaPedidos.appendChild(tr);
    });

    // LÓGICA DEL BOTÓN ENTREGADO
    document.querySelectorAll(".done-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idx = e.target.getAttribute("data-index");
            const pedidoSeleccionado = historialGlobal[idx];
            try {
                const res = await fetch('http://127.0.0.1:5000/completar_entrega', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ cliente: pedidoSeleccionado.cliente })
                });
                if (res.ok) {
                    alert(`🎉 ¡Pedido de ${pedidoSeleccionado.cliente} despachado con éxito!`);
                    await cargarHistorialDesdeServidor();
                }
            } catch (error) {
                console.error(error);
            }
        });
    });

    // LÓGICA DEL NUEVO BOTÓN CANCELAR
    document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idx = e.target.getAttribute("data-index");
            const pedidoSeleccionado = historialGlobal[idx];
            
            if (confirm(`¿Estás seguro de que deseas cancelar la orden de ${pedidoSeleccionado.cliente}?`)) {
                try {
                    // Enviamos una nueva ruta específica para cancelaciones
                    const res = await fetch('http://127.0.0.1:5000/cancelar_orden', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ cliente: pedidoSeleccionado.cliente })
                    });
                    
                    if (res.ok) {
                        alert(`❌ Orden de ${pedidoSeleccionado.cliente} marcada como Cancelada.`);
                        await cargarHistorialDesdeServidor();
                    } else {
                        alert("❌ El servidor rechazó la solicitud de cancelación.");
                    }
                } catch (error) {
                    console.error("Error en la petición de cancelación:", error);
                }
            }
        });
    });
}


    // --- 3. RENDERIZADO PARA LA TABLA DE HISTORIAL.HTML ---
    function renderTablaHistorial() {
        if (!tablaHistorial) return;
        tablaHistorial.innerHTML = "";

        if (historialGlobal.length === 0) {
            tablaHistorial.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#666; font-style:italic;">El historial de balances está vacío.</td></tr>`;
            return;
        }

        historialGlobal.forEach((pedido) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";
            
            tr.innerHTML = `
                <td style="padding: 12px; border: 1px solid #eee;">${pedido.fechaCompra ? pedido.fechaCompra.split(' ')[0] : '-'}</td>
                <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">${pedido.fechaEntrega ? pedido.fechaEntrega.split(' ')[0] : '-'}</td>
                <td style="padding: 12px; border: 1px solid #eee;"><strong>${pedido.cliente}</strong><br><small style="color:#666;">${pedido.direccion || 'WhatsApp'}</small></td>
                <td style="padding: 12px; border: 1px solid #eee;">${pedido.producto}</td>
                <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">Bs. ${parseFloat(pedido.subtotal || 0).toFixed(2)}</td>
                <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">${pedido.estadoPago}</td>
                <td style="padding: 12px; border: 1px solid #eee; color: #666;">${pedido.estadoEntrega || 'Pendiente'}</td>
            `;
            tablaHistorial.appendChild(tr);
        });
    }

    // --- 4. CAPTURA SEGURO DEL FORMULARIO ---
    if (adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Buscamos los elementos de forma segura (pueden no existir en todas las páginas)
            const elCelular = document.getElementById("clienteCelular");
            const elDireccion = document.getElementById("clienteDireccion");
            const elEstado = document.getElementById("estadoPedido") || document.getElementById("estadoPago");

            // Armamos el objeto con respaldos automáticos por si el campo es nulo
            const payload = {
                nombre: document.getElementById("clienteName").value,
                celular: elCelular ? elCelular.value : "70000000",
                direccion: elDireccion ? elDireccion.value : "Venta directa sin dirección",
                producto: document.getElementById("productoSelect").value,
                metodo: document.getElementById("metodoPago").value,
                estadoPago: elEstado ? elEstado.value : "Pendiente"
            };

            try {
                // Enviamos los datos directamente al servidor Flask
                const res = await fetch('http://127.0.0.1:5000/registrar_cliente', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
                
                const resultado = await res.json();

                if (res.ok) {
                    alert("🎉 ¡Conexión Exitosa! Datos registrados en ventas_crochet.db");
                    adminForm.reset();
                    // Refrescamos los datos de las tablas de inmediato
                    await cargarHistorialDesdeServidor();
                } else {
                    alert("❌ Error devuelto por el servidor: " + resultado.error);
                }
            } catch (error) {
                alert("❌ No se pudo conectar con Flask. Verifica que main.py esté ejecutándose.");
                console.error(error);
            }
        });
    }

    // Arrancar la carga apenas se abra la página actual
    cargarHistorialDesdeServidor();
});
