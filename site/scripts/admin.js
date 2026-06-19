document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");

    let pedidos = JSON.parse(localStorage.getItem("pedidos_dueña")) || [];

    function renderTabla() {
        if (!tablaPedidos) return; 
        tablaPedidos.innerHTML = "";

        if (pedidos.length === 0) {
            tablaPedidos.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">No hay pedidos pendientes de entrega.</td></tr>`;
            return;
        }

        pedidos.forEach((pedido, index) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #C1E1C1";

            tr.innerHTML = `
                <td style="padding: 12px;"><strong>${pedido.cliente}</strong></td>
                <td style="padding: 12px;">${pedido.producto}</td>
                <td style="padding: 12px;">${pedido.metodo}</td>
                <td style="padding: 12px; font-weight: bold; color: #b07d00;">${pedido.estado}</td>
                <td style="padding: 12px; text-align: center;">
                    <button class="delete-btn" data-index="${index}" style="padding: 6px 12px; background-color: #1b4d2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ✅ Entregado
                    </button>
                </td>
            `;
            tablaPedidos.appendChild(tr);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.getAttribute("data-index");
                pedidos.splice(idx, 1); 
                localStorage.setItem("pedidos_dueña", JSON.stringify(pedidos)); 
                renderTabla(); 
            });
        });
    }

    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nuevoPedido = {
                cliente: document.getElementById("clienteName").value,
                producto: document.getElementById("productoSelect").value,
                metodo: document.getElementById("metodoPago").value,
                estado: document.getElementById("estadoPedido").value
            };

            pedidos.push(nuevoPedido); // Agrega el pedido al arreglo
            localStorage.setItem("pedidos_dueña", JSON.stringify(pedidos)); // Guarda en memoria local
            adminForm.reset(); // Limpia las cajas de texto del formulario
            alert("✅ Pedido guardado con éxito. Pasa a la pestaña 'Ver Lista de Pedidos' para revisarlo.");
        });
    }

    renderTabla();
});
