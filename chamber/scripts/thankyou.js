document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const userData = document.getElementById('user-data');
    for (const [key, value] of params.entries()) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        userData.appendChild(li);
    }
});
