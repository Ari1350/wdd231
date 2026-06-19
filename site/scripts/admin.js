document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");

    let listaPedidos = JSON.parse(localStorage.getItem("pedidos_tienda_crochet")) || [];

    function renderTabla() {
        if (!tablaPedidos) return; 
        tablaPedidos.innerHTML = "";

        if (listaPedidos.length === 0) {
            tablaPedidos.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#1b4d2e; font-style:italic;">No existen entregas o pedidos pendientes en este momento.</td></tr>`;
            return;
        }

        listaPedidos.forEach((pedido, index) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";

            let colorEstado = pedido.estado === "Completado" ? "#137333" : "#b07d00";

            tr.innerHTML = `
                <td style="padding: 12px;"><strong>${pedido.cliente}</strong></td>
                <td style="padding: 12px;">${pedido.producto}</td>
                <td style="padding: 12px;">${pedido.metodo}</td>
                <td style="padding: 12px; font-weight: bold; color: ${colorEstado};">${pedido.estado}</td>
                <td style="padding: 12px; text-align: center;">
                    <button class="action-done-btn" data-index="${index}" style="padding: 6px 12px; background-color: #1b4d2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: inherit;">
                        ✅ Finalizar Entrega
                    </button>
                </td>
            `;
            tablaPedidos.appendChild(tr);
        });

        document.querySelectorAll(".action-done-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.getAttribute("data-index");
                listaPedidos.splice(idx, 1); 
                localStorage.setItem("pedidos_tienda_crochet", JSON.stringify(listaPedidos)); 
                renderTabla(); 
            });
        });
    }

    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nuevoRegistro = {
                cliente: document.getElementById("clienteName").value,
                producto: document.getElementById("productoSelect").value,
                metodo: document.getElementById("metodoPago").value,
                estado: document.getElementById("estadoPedido").value
            };

            listaPedidos.push(nuevoRegistro); 
            localStorage.setItem("pedidos_tienda_crochet", JSON.stringify(listaPedidos)); 
            adminForm.reset(); 

            alert("🔄 [Conexión Segura] Procesando transacción...\n\n✅ Venta guardada y sincronizada correctamente en la lista de control.");
        });
    }

    renderTabla();
});
