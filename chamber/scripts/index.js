document.addEventListener('DOMContentLoaded', () => {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiKey = "e01611c6b4704ce75b57d1e31ab2086d";
    const url = 'https://api.openweathermap.org/data/2.5/weather?lat=-17.7833&lon=-63.1821&units=metric&appid=TU_API_KEY';
    const membersJsonUrl = "data/index.json";

    fetch(proxyUrl + url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('current-temp').textContent = `${data.main.temp.toFixed(1)}°C`;
            document.getElementById('current-desc').textContent = data.weather[0].description;
        })
        .catch(error => console.error('Error fetching weather data:', error));

    fetch(membersJsonUrl)
        .then(response => response.json())
        .then(data => {
            const members = data.filter(member => member.level === 'gold' || member.level === 'silver');
            const selectedMembers = members.sort(() => 0.5 - Math.random()).slice(0, 3);
            const highlightContainer = document.querySelector('.highlight-container');

            selectedMembers.forEach(member => {
                const card = document.createElement('div');
                card.className = 'member-card';
                card.innerHTML = `
                    <img src="${member.logo}" alt="${member.name} Logo">
                    <h3>${member.name}</h3>
                    <p>${member.tagline}</p>
                    <p>Email: <a href="mailto:${member.email}">${member.email}</a></p>
                    <p>Phone: ${member.phone}</p>
                    <p>Website: <a href="${member.website}" target="_blank">${member.website}</a></p>
                    <p>Membership Level: ${member.level}</p>
                `;
                highlightContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching members data:', error));
});

