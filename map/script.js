const map = L.map('map').setView([49.2328, 28.48097], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let allPlaces = [];
let markers = [];

fetch("places.json")
    .then(response => response.json())
    .then(places => {
        allPlaces = places;
        showPlaces(allPlaces);
    })
    .catch(error => {
        console.error("Помилка завантаження places.json:", error);
    });

function showPlaces(places) {

    // Видаляємо старі маркери
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Додаємо нові
    places.forEach(place => {

        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(`
                <b>${place.name}</b><br><br>

                📍 ${place.address || ""}<br>
                💰 ${place.price || ""}<br>
                📞 ${place.phone || ""}<br><br>

                ${place.instagram
                    ? `<a href="${place.instagram}" target="_blank">📷 Instagram</a><br>`
                    : ""
                }

                ${place.maps
                    ? `<a href="${place.maps}" target="_blank">📍 Google Maps</a>`
                    : ""
                }
            `);

        markers.push(marker);
    });
}


// Фільтри
document.querySelectorAll("#filters button").forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        // Активна кнопка
        document
            .querySelectorAll("#filters button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        // Всі місця
        if (filter === "all") {
            showPlaces(allPlaces);
            return;
        }

        // Фільтруємо
        const filteredPlaces = allPlaces.filter(place => {

            const value = String(place[filter] || "")
                .trim()
                .toLowerCase();

            return value === "так" ||
                   value === "є" ||
                   value === "yes" ||
                   value === "true" ||
                   value === "1";
        });

        showPlaces(filteredPlaces);
    });

});


// Кнопка "Всі" активна спочатку
document
    .querySelector('#filters button[data-filter="all"]')
    .classList.add("active");