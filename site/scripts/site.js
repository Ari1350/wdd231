document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("currentyear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const lastModEl = document.getElementById("lastModified");
  if (lastModEl) lastModEl.textContent = `Last modified: ${document.lastModified}`;

  const menuToggle = document.getElementById("menu-toggle");
  const navList = document.querySelector("nav ul");
  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      navList.classList.toggle("active");
    });
  }

  if (document.getElementById("featured")) loadFeatured();
  if (document.getElementById("products")) loadProducts();
});

// URL de tu servidor Python (Nivel Conceptual)
const API_URL = "http://127.0.0.1:5000/obtener_productos";

async function loadFeatured() {
  try {
    // Ahora pedimos los datos al servidor Python, no al JSON estático
    const res = await fetch(API_URL);
    const data = await res.json();
    const featured = document.getElementById("featured");
    if (!featured) return;

    // Mostramos solo los primeros 4
    data.slice(0, 4).forEach(item => {
      featured.appendChild(createCard(item));
    });
  } catch (err) {
    console.error("Error al cargar destacados desde la BD:", err);
  }
}

async function loadProducts() {
  try {
    // Conexión en vivo con SQLite vía Flask
    const res = await fetch(API_URL);
    const data = await res.json();
    const list = document.getElementById("products");
    const search = document.getElementById("search");
    if (!list || !search) return;

    function render(items) {
      list.innerHTML = "";
      items.forEach(item => list.appendChild(createCard(item)));
    }

    render(data);

    // Buscador interactivo usando los datos de la base de datos
    search.addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      // Buscamos por el campo 'Nombre' que viene de la tabla Producto
      const filtered = data.filter(d => d.Nombre.toLowerCase().includes(term));
      render(filtered);
    });
  } catch (err) {
    console.error("Error al cargar catálogo desde la BD:", err);
    const list = document.getElementById("products");
    if (list) list.innerHTML = "<p>Error: Asegúrate de que main.py esté corriendo.</p>";
  }
}

function createCard(item) {
  const miNumero = "59177302832"; 
  
  // Como ahora los nombres están en tu BD, puedes ponerlos directamente en español en SQLite
  // y ya no necesitas todos esos "if" de traducción en el código.
  const nombreDisplay = item.Nombre;

  // Generamos el mensaje para WhatsApp usando los datos de la BD
  const textoMensaje = encodeURIComponent(`Buenas, quisiera comprar la ${nombreDisplay} de ${item.Precio}bs.`);
  const whatsappUrl = `https://wa.me/${miNumero}?text=${textoMensaje}`;

  // NOTA: Si tu tabla 'Producto' aún no tiene columna 'imagen' o 'descripcion', 
  // usaremos valores por defecto para que no se vea vacío.
  const imagen = item.Imagen || "images/placeholder.jpg"; 
  const descripcion = item.Descripcion || "Producto artesanal hecho a mano con amor.";

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${imagen}" alt="${nombreDisplay}" loading="lazy">
    <div class="card-content">
      <h3>${nombreDisplay}</h3>
      <p>${descripcion}</p>
      <p class="price-tag"><strong>Precio:</strong> Bs. ${item.Precio}</p>
      <a href="${whatsappUrl}" target="_blank" class="view-details-btn" style="text-decoration: none; display: block; text-align: center; box-sizing: border-box;">
        Pedir por WhatsApp 💬
      </a>
    </div>
  `;

  return div;
}