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

async function loadFeatured() {
  try {
    const res = await fetch("scripts/data.json");
    const data = await res.json();
    const featured = document.getElementById("featured");
    if (!featured) return;

    data.slice(0, 4).forEach(item => {
      featured.appendChild(createCard(item));
    });
  } catch (err) {
    console.error("Error loading featured:", err);
  }
}

// Carga todo el catálogo y maneja el buscador (products.html)
async function loadProducts() {
  try {
    const res = await fetch("scripts/data.json");
    const data = await res.json();
    const list = document.getElementById("products");
    const search = document.getElementById("search");
    if (!list || !search) return;

    function render(items) {
      list.innerHTML = "";
      items.forEach(item => list.appendChild(createCard(item)));
    }

    render(data);

    // Buscador interactivo en tiempo real
    search.addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      const filtered = data.filter(d => d.title.toLowerCase().includes(term));
      render(filtered);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Genera la tarjeta de cada peluche con el botón directo a WhatsApp
function createCard(item) {
  // CONFIGURACIÓN DEL ENLACE A WHATSAPP AUTOMÁTICO
  const miNumero = "59177302832"; 
  
  let nombreEspanol = item.title;
  if (item.title === "Crochet Cow") nombreEspanol = "Vaquita de Crochet";
  if (item.title === "Crochet Chick") nombreEspanol = "Pollito de Crochet";
  if (item.title === "Crochet Bee") nombreEspanol = "Abejita de Crochet";
  if (item.title === "Crochet Capybara") nombreEspanol = "Carpincho de Crochet";
  if (item.title === "Crochet Sunflowers") nombreEspanol = "Girasoles de Crochet";
  if (item.title === "Crochet Roses") nombreEspanol = "Rosas de Crochet";
  if (item.title === "Crochet Tulips") nombreEspanol = "Tulipanes de Crochet";

  // mensaje exacto
  const textoMensaje = encodeURIComponent(`Buenas, quisiera comprar la ${nombreEspanol} de ${item.price}bs.`);
  const whatsappUrl = `https://wa.me/${miNumero}?text=${textoMensaje}`;

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${item.image}" alt="${item.title}" loading="lazy">
    <div class="card-content">
      <h3>${nombreEspanol}</h3>
      <p>${item.description}</p>
      <p class="price-tag"><strong>Precio:</strong> Bs. ${item.price}</p>
      <!-- El botón ahora es una etiqueta de enlace directo a WhatsApp -->
      <a href="${whatsappUrl}" target="_blank" class="view-details-btn" style="text-decoration: none; display: block; text-align: center; box-sizing: border-box;">
        Pedir por WhatsApp 💬
      </a>
    </div>
  `;

  return div;
}
