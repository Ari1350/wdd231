document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const userData = document.getElementById('data-user');
    for (const [key, value] of params.entries()) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        userData.appendChild(li);
    }
});
