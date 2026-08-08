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
    // 📍 Пошук місць поруч
document.getElementById("nearMeButton").addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Ваш браузер не підтримує визначення місцезнаходження.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {

            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Показуємо позицію користувача
            L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("📍 Ви знаходитесь тут")
                .openPopup();

            // Центруємо карту
            map.setView([userLat, userLng], 12);

            // Рахуємо відстань до кожного місця
            allPlaces.forEach(place => {
                place.distance = getDistance(
                    userLat,
                    userLng,
                    place.lat,
                    place.lng
                );
            });

            // Сортуємо від найближчого
            const nearby = [...allPlaces].sort(
                (a, b) => a.distance - b.distance
            );

            // Показуємо найближчі місця
            showPlaces(nearby);

            alert(
                "📍 Найближче місце: " +
                nearby[0].name +
                " — " +
                nearby[0].distance.toFixed(1) +
                " км"
            );
        },

        error => {
            if (error.code === 1) {
                alert("📍 Дозвольте доступ до вашого місцезнаходження.");
            } else {
                alert("Не вдалося визначити ваше місцезнаходження.");
            }
        }
    );
});


// Розрахунок відстані між двома координатами
function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
}