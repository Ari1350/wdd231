document.addEventListener('DOMContentLoaded', () => {
    const weatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=49.75&lon=6.64&units=metric&appid=TU_API_KEY";
    const membersJsonUrl = "data/index.json";


    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            const currentWeather = data.list[0];
            document.getElementById('current-temp').textContent = `${currentWeather.main.temp}°C`;
            document.getElementById('current-desc').textContent = currentWeather.weather[0].description;

            const forecastContainer = document.getElementById('forecast');
            forecastContainer.innerHTML = "";
            for (let i = 1; i <= 3; i++) {
                const forecast = data.list[i * 8];
                const li = document.createElement('li');
                lli.textContent = `Day ${i}: ${forecast.main.temp.toFixed(1)}°C - ${forecast.weather[0].description}`;
                forecastContainer.appendChild(li);
            }
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
