document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");

    async function loadMembers() {
        const response = await fetch('data/members.json');
        const members = await response.json();

        content.innerHTML = members.map(member => `
            <div class="member-card">
                <img src="${member.image}" alt="${member.name}">
                <h2>${member.name}</h2>
                <p>${member.address}</p>
                <p>${member.phone}</p>
                <a href="${member.website}" target="_blank">Visit Website</a>
            </div>
        `).join('');
    }

    loadMembers();

    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("last-modified").textContent = document.lastModified;
});
