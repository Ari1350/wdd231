document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const tablaPedidos = document.getElementById("tablaPedidos");
    const consolaProgramador = document.getElementById("consolaProgramador");
    const btnExportar = document.getElementById("btnExportar");

    let pedidos = JSON.parse(localStorage.getItem("pedidos_dueña")) || [];
    let historialGlobal = JSON.parse(localStorage.getItem("historial_programador")) || [];

    function renderTabla() {
        if (tablaPedidos) {
            tablaPedidos.innerHTML = "";

            if (pedidos.length === 0) {
                tablaPedidos.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#1b4d2e;">No hay pedidos pendientes de entrega.</td></tr>`;
            } else {
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
                        renderConsolaProgramadora(); 
                    });
                });
            }
        }
    }

    function renderConsolaProgramadora() {
        if (!consolaProgramador) return;
        
        const baseDeDatosSimulada = {
            fecha_consulta: new Date().toLocaleString(),
            total_registros_historicos: historialGlobal.length,
            pedidos_actuales_en_pantalla: pedidos,
            historial_completo_guardado: historialGlobal
        };

        consolaProgramador.textContent = JSON.stringify(baseDeDatosSimulada, null, 2);
    }

    if (btnExportar) {
        btnExportar.addEventListener("click", () => {
            if (historialGlobal.length === 0) {
                alert("⚠ No hay datos en el historial para exportar todavía.");
                return;
            }

            let codigoSQL = `-- ============================================================\n`;
            codigoSQL += `-- SCRIPT GENERADO DESDE LA WEB - PARA RESPALDO EN POSTGRESQL\n`;
            codigoSQL += `-- ============================================================\n\n`;

            historialGlobal.forEach(p => {
                const clienteLimpiado = p.cliente.replace(/'/g, "''");
                const productoLimpiado = p.producto.replace(/'/g, "''");
                const metodoLimpiado = p.metodo.replace(/'/g, "''");
                const estadoLimpiado = p.estado.replace(/'/g, "''");

                codigoSQL += `INSERT INTO Cliente (celular, nombre, direccion) VALUES ('Generico WA', '${clienteLimpiado}', 'Direccion Web') ON CONFLICT DO NOTHING;\n`;
                codigoSQL += `INSERT INTO Pedido (celular_cliente) VALUES ('Generico WA');\n`;
                codigoSQL += `INSERT INTO Pago (monto, estado_pago, id_pedido, id_metodo) VALUES (45.00, '${estadoLimpiado}', currval('pedido_id_pedido_seq'), 1);\n\n`;
            });

            // Descarga automática del archivo .sql en la computadora
            const blob = new Blob([codigoSQL], { type: "text/sql" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "respaldo_tienda_crochet.sql";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

            pedidos.push(nuevoPedido);
            localStorage.setItem("pedidos_dueña", JSON.stringify(pedidos));

            historialGlobal.push(nuevoPedido);
            localStorage.setItem("historial_programador", JSON.stringify(historialGlobal));

            adminForm.reset(); 
            alert("✅ Pedido guardado en el navegador. Revisa la pestaña 'Ver Lista de Pedidos'.");
            
            renderTabla();
            renderConsolaProgramadora();
        });
    }

    renderTabla();
    renderConsolaProgramadora();
});
