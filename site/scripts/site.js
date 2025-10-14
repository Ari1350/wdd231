document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  const yearEl = document.getElementById("currentyear");
  if (yearEl) yearEl.textContent = year;

  const lastModEl = document.getElementById("lastModified");
  if (lastModEl) lastModEl.textContent = `Last modified: ${document.lastModified}`;

  const menuToggle = document.getElementById("menu-toggle");
  const navList = document.querySelector("nav ul");
  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      navList.classList.toggle("active");
    });
};

  if (document.getElementById("featured")) loadFeatured();
  if (document.getElementById("products")) loadProducts();
  if (document.getElementById("contactForm")) handleForm();

  setupModal();
});

function setupModal() {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("closeModal");

  if (!modal || !modalBody || !closeModal) return;

  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });

  window.openModal = (item) => {
    modalBody.innerHTML = `
      <h2>${item.title}</h2>
      <img src="${item.image}" alt="${item.title}" style="width:100%; border-radius:8px;">
      <p>${item.description}</p>
      <p><strong>Address:</strong> ${item.address}</p>
    `;
    modal.style.display = "flex";
  };
}

async function loadFeatured() {
  try {
    const res = await fetch("scripts/data.json");
    const data = await res.json();
    const featured = document.getElementById("featured");
    if (!featured) return;

    data.slice(0, 4).forEach(item => {
      const card = createCard(item);
      featured.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading featured:", err);
  }
}

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

    const lastSearch = localStorage.getItem("lastSearch") || "";
    search.value = lastSearch;
    const filteredInit = data.filter(d => d.title.toLowerCase().includes(lastSearch.toLowerCase()));
    render(filteredInit.length ? filteredInit : data);

    search.addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      localStorage.setItem("lastSearch", term); // Guarda búsqueda
      const filtered = data.filter(d => d.title.toLowerCase().includes(term));
      render(filtered);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function createCard(item) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${item.image}" alt="${item.title}" loading="lazy">
    <div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <p><strong>Address:</strong> ${item.address}</p>
      <button class="view-details">View Details</button>
    </div>
  `;

  const btn = div.querySelector(".view-details");
  if (btn) btn.addEventListener("click", () => openModal(item)); // abre modal
  return div;
}

function handleForm() {
  const form = document.getElementById("contactForm");
  const output = document.getElementById("output");
  if (!form || !output) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);
    let result = "<h3>Form Data Submitted:</h3><ul>";
    for (const [key, value] of formData.entries()) {
      result += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    result += "</ul>";
    output.innerHTML = result;
    form.reset();
  });
}
