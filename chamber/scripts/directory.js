document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const gridButton = document.getElementById("grid");
    const listButton = document.getElementById("list");

    async function loadMembers() {
        const response = await fetch('data/members.json');
        const members = await response.json();
        renderMembers(members, "grid");
        content.dataset.members = JSON.stringify(members);
    }

    function renderMembers(members, view) {
        content.className = view; 
        content.innerHTML = members.map(member => `
            <div class="member-card">
                <img src="${member.image}" alt="${member.name}">
                <div>
                    <h2>${member.name}</h2>
                    <p>${member.address}</p>
                    <p>${member.phone}</p>
                    <a href="${member.website}" target="_blank">Visit Website</a>
                </div>
            </div>
        `).join('');
    }

    gridButton.addEventListener("click", () => {
        const members = JSON.parse(content.dataset.members);
        renderMembers(members, "grid");
    });

    listButton.addEventListener("click", () => {
        const members = JSON.parse(content.dataset.members);
        renderMembers(members, "list");
    });

    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("last-modified").textContent = document.lastModified;

    loadMembers();
});

