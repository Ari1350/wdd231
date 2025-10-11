document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  document.getElementById("year")?.textContent = year;
  document.getElementById("year2")?.textContent = year;
  document.getElementById("year3")?.textContent = year;

  if (document.getElementById("featured")) loadFeatured();
  if (document.getElementById("products")) loadProducts();
  if (document.getElementById("contactForm")) handleForm();
});

async function loadFeatured() {
  try {
    const res = await fetch("js/data.json");
    const data = await res.json();
    const featured = document.getElementById("featured");
    data.forEach(item => {
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

    function render(items) {
      list.innerHTML = "";
      items.forEach(item => list.appendChild(createCard(item)));
    }

    render(data);

    search.addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      const filtered = data.filter(d =>
        d.title.toLowerCase().includes(term)
      );
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
    <img src="${item.image}" alt="${item.title}">
    <div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <p><strong>Address:</strong> ${item.address}</p>
    </div>
  `;
  return div;
}

function handleForm() {
  const form = document.getElementById("contactForm");
  const output = document.getElementById("output");

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
