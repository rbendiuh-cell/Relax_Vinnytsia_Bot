const map = L.map("map").setView([49.2328, 28.48097], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(map);

let allPlaces = [];
let markers = [];
let userMarker = null;


// =========================
// ЗАВАНТАЖЕННЯ МІСЦЬ
// =========================

fetch("places.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Не вдалося завантажити places.json");
        }

        return response.json();
    })
    .then(places => {

        allPlaces = places;

        console.log("Завантажено місць:", allPlaces.length);

        showPlaces(allPlaces);
    })
    .catch(error => {

        console.error("Помилка:", error);

        alert("Не вдалося завантажити карту місць.");
    });


// =========================
// ПОКАЗ МАРКЕРІВ
// =========================

function showPlaces(places) {

    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    markers = [];

    places.forEach(place => {

        const lat = Number(place.lat);
        const lng = Number(place.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return;
        }

        const marker = L.marker([lat, lng])
            .addTo(map);

        let popup = `
            <div style="min-width:220px">

                <h3>${place.name || "Місце відпочинку"}</h3>

                ${place.address
                    ? `📍 ${place.address}<br><br>`
                    : ""
                }

                ${place.price
                    ? `💰 ${place.price}<br><br>`
                    : ""
                }

                ${place.phone
                    ? `📞 ${place.phone}<br><br>`
                    : ""
                }

                ${
                    place.instagram
                        ? `<a href="${place.instagram}" target="_blank">
                             📷 Instagram
                           </a><br><br>`
                        : ""
                }

                ${
                    place.maps
                        ? `<a href="${place.maps}" target="_blank">
                             📍 Google Maps
                           </a>`
                        : ""
                }

            </div>
        `;

        marker.bindPopup(popup);

        markers.push(marker);
    });
}


// =========================
// ФІЛЬТРИ
// =========================

document.querySelectorAll("#filters button").forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        document
            .querySelectorAll("#filters button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");


        if (filter === "all") {

            showPlaces(allPlaces);

            return;
        }


        const filteredPlaces = allPlaces.filter(place => {

            const value = String(place[filter] || "")
                .trim()
                .toLowerCase();

            return (
                value === "так" ||
                value === "є" ||
                value === "yes" ||
                value === "true" ||
                value === "1"
            );
        });


        showPlaces(filteredPlaces);
    });

});


// =========================
// КНОПКА "ВСІ"
// =========================

const allButton = document.querySelector(
    '#filters button[data-filter="all"]'
);

if (allButton) {
    allButton.classList.add("active");
}


// =========================
// ПОРУЧ ЗІ МНОЮ
// =========================

const nearMeButton = document.getElementById("nearMeButton");

if (nearMeButton) {

    nearMeButton.addEventListener("click", () => {

        if (!navigator.geolocation) {

            alert("Ваш браузер не підтримує визначення місцезнаходження.");

            return;
        }


        navigator.geolocation.getCurrentPosition(

            position => {

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;


                // Видаляємо стару позначку користувача

                if (userMarker) {
                    map.removeLayer(userMarker);
                }


                // Ставимо позначку користувача

                userMarker = L.marker([
                    userLat,
                    userLng
                ])
                    .addTo(map)
                    .bindPopup("📍 Ви знаходитесь тут")
                    .openPopup();


                // Переміщуємо карту

                map.setView([
                    userLat,
                    userLng
                ], 12);


                // Рахуємо відстань

                const nearby = allPlaces
                    .map(place => {

                        const lat = Number(place.lat);
                        const lng = Number(place.lng);

                        return {
                            ...place,
                            distance: getDistance(
                                userLat,
                                userLng,
                                lat,
                                lng
                            )
                        };

                    })
                    .filter(place => Number.isFinite(place.distance))
                    .sort((a, b) => a.distance - b.distance);


                // Показуємо найближчі

                showPlaces(nearby);


                if (nearby.length > 0) {

                    alert(
                        "📍 Найближче місце:\n\n" +
                        nearby[0].name +
                        "\n" +
                        nearby[0].distance.toFixed(1) +
                        " км"
                    );
                }

            },

            error => {

                if (error.code === 1) {

                    alert(
                        "📍 Дозвольте доступ до вашого місцезнаходження."
                    );

                } else {

                    alert(
                        "Не вдалося визначити ваше місцезнаходження."
                    );
                }

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    });

}


// =========================
// РОЗРАХУНОК ВІДСТАНІ
// =========================

function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}