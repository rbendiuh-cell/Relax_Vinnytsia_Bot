const map = L.map('map').setView([49.2328, 28.48097], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let allPlaces = [];
let markers = [];

fetch('places.json')
    .then(response => response.json())
    .then(places => {
        allPlaces = places;
        showPlaces(allPlaces);
    })
    .catch(error => {
        console.error('Помилка завантаження places.json:', error);
    });


function showPlaces(places) {

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    places.forEach(place => {

        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(`
                <b>${place.name}</b><br><br>
                📍 ${place.address || ''}<br>
                💰 ${place.price || ''}<br>
                📞 ${place.phone || ''}<br><br>

                ${
                    place.instagram
                        ? `<a href="${place.instagram}" target="_blank">📷 Instagram</a><br>`
                        : ''
                }

                ${
                    place.maps
                        ? `<a href="${place.maps}" target="_blank">📍 Google Maps</a>`
                        : ''
                }
            `);

        markers.push(marker);
    });
}


// ФІЛЬТРИ

document.querySelectorAll('#filters button').forEach(button => {

    button.addEventListener('click', () => {

        const filter = button.dataset.filter;

        document
            .querySelectorAll('#filters button')
            .forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');

        if (filter === 'all') {
            showPlaces(allPlaces);
            return;
        }

        const filteredPlaces = allPlaces.filter(place => {

            const value = String(place[filter] || '')
                .trim()
                .toLowerCase();

            return (
                value === 'так' ||
                value === 'є' ||
                value === 'yes' ||
                value === 'true' ||
                value === '1'
            );
        });

        showPlaces(filteredPlaces);
    });

});


// Кнопка "Всі" активна спочатку

const allButton = document.querySelector(
    '#filters button[data-filter="all"]'
);

if (allButton) {
    allButton.classList.add('active');
}


// 📍 ПОРУЧ ЗІ МНОЮ

const nearMeButton = document.getElementById('nearMeButton');

if (nearMeButton) {

    nearMeButton.addEventListener('click', () => {

        if (!navigator.geolocation) {
            alert('Ваш браузер не підтримує визначення місцезнаходження.');
            return;
        }

        navigator.geolocation.getCurrentPosition(

            position => {

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup('📍 Ви знаходитесь тут')
                    .openPopup();

                map.setView([userLat, userLng], 12);

                allPlaces.forEach(place => {

                    place.distance = getDistance(
                        userLat,
                        userLng,
                        place.lat,
                        place.lng
                    );

                });

                const nearby = [...allPlaces].sort(
                    (a, b) => a.distance - b.distance
                );

                showPlaces(nearby);

                if (nearby.length > 0) {

                    alert(
                        '📍 Найближче місце: ' +
                        nearby[0].name +
                        ' — ' +
                        nearby[0].distance.toFixed(1) +
                        ' км'
                    );

                }

            },

            error => {

                if (error.code === 1) {
                    alert('📍 Дозвольте доступ до вашого місцезнаходження.');
                } else {
                    alert('Не вдалося визначити ваше місцезнаходження.');
                }

            }

        );

    });

}


// Відстань між координатами

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