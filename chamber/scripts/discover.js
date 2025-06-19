document.addEventListener("DOMContentLoaded", () => {
    const visitMessage = document.getElementById("visit-message");
    const gridContainer = document.querySelector(".grid-container");
    const lastVisitKey = "last-visit";
    const dataUrl = "scripts/items.json";

    function calculateDays(lastVisit) {
        const now = Date.now();
        const days = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        return days;
    }

    const lastVisit = localStorage.getItem(lastVisitKey);
    if (lastVisit) {
        const days = calculateDays(parseInt(lastVisit));
        if (days < 1) {
            visitMessage.textContent = "Welcome back! Great to see you again!";
        } else if (days === 1) {
            visitMessage.textContent = "Your last visit was 1 day ago.";
        } else {
            visitMessage.textContent = `Your last visit was ${days} days ago.`;
        }
    } else {
        visitMessage.textContent = "Welcome! If you have any questions, let us know.";
    }
    localStorage.setItem(lastVisitKey, Date.now());

    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach((item, index) => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.style.gridArea = `card${index + 1}`;
                card.innerHTML = `
                    <h2>${item.title}</h2>
                    <figure>
                        <img src="${item.image}" alt="${item.title}">
                    </figure>
                    <address>${item.address}</address>
                    <p>${item.description}</p>
                    <button onclick="alert('Learn more about ${item.title}!')">Learn More</button>
                `;
                gridContainer.appendChild(card);
            });
        })
        .catch(error => console.error("Error loading data:", error));
});
