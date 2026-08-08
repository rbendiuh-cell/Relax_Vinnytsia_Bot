// =====================================================
// КАРТА
// =====================================================

const map = L.map("map").setView(
    [49.2328, 28.48097],
    10
);


// OpenStreetMap

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);


// =====================================================
// ДАНІ
// =====================================================

let allPlaces = [];
let markers = [];


// =====================================================
// ЗАВАНТАЖЕННЯ PLACES.JSON
// =====================================================

fetch("./places.json")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Не вдалося завантажити places.json"
            );
        }

        return response.json();
    })

    .then(places => {

        console.log("Місця завантажені:", places);

        allPlaces = places;

        showPlaces(allPlaces);
    })

    .catch(error => {

        console.error(
            "ПОМИЛКА КАРТИ:",
            error
        );

        alert(
            "Не вдалося завантажити місця."
        );
    });


// =====================================================
// ПОКАЗ МІСЦЬ
// =====================================================

function showPlaces(places) {

    // видаляємо старі маркери

    markers.forEach(marker => {

        map.removeLayer(marker);

    });

    markers = [];


    // додаємо нові

    places.forEach(place => {

        if (
            place.lat === undefined ||
            place.lng === undefined
        ) {
            return;
        }


        const marker = L.marker(
            [
                Number(place.lat),
                Number(place.lng)
            ]
        );


        marker.addTo(map);


        let popup = `
            <div style="min-width:220px">

                <h3>
                    ${place.name || "Без назви"}
                </h3>

                ${place.city
                    ? `📍 ${place.city}<br>`
                    : ""
                }

                ${place.address
                    ? `📌 ${place.address}<br>`
                    : ""
                }

                ${place.price
                    ? `💰 ${place.price}<br>`
                    : ""
                }

                ${place.phone
                    ? `📞 ${place.phone}<br>`
                    : ""
                }

        `;


        if (place.instagram) {

            popup += `
                <br>
                <a
                    href="${place.instagram}"
                    target="_blank"
                >
                    📷 Instagram
                </a>
            `;
        }


        if (place.maps) {

            popup += `
                <br>
                <a
                    href="${place.maps}"
                    target="_blank"
                >
                    📍 Google Maps
                </a>
            `;
        }


        popup += `
            </div>
        `;


        marker.bindPopup(popup);


        markers.push(marker);

    });
}


// =====================================================
// ФІЛЬТРИ
// =====================================================

document
    .querySelectorAll("#filters button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll("#filters button")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                const filter =
                    button.dataset.filter;


                if (filter === "all") {

                    showPlaces(allPlaces);

                    return;
                }


                const filtered =
                    allPlaces.filter(place => {

                        const value =
                            String(
                                place[filter] || ""
                            )
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


                showPlaces(filtered);

            }
        );

    });


// =====================================================
// АКТИВНА КНОПКА "ВСІ"
// =====================================================

const allButton =
    document.querySelector(
        '#filters button[data-filter="all"]'
    );


if (allButton) {

    allButton.classList.add(
        "active"
    );

}


// =====================================================
// ПОРУЧ ЗІ МНОЮ
// =====================================================

const nearMeButton =
    document.getElementById(
        "nearMeButton"
    );


if (nearMeButton) {

    nearMeButton.addEventListener(
        "click",
        () => {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Ваш браузер не підтримує геолокацію."
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    const userLat =
                        position.coords.latitude;

                    const userLng =
                        position.coords.longitude;


                    // позиція користувача

                    L.marker([
                        userLat,
                        userLng
                    ])
                    .addTo(map)
                    .bindPopup(
                        "📍 Ви знаходитесь тут"
                    )
                    .openPopup();


                    map.setView(
                        [
                            userLat,
                            userLng
                        ],
                        12
                    );


                    // рахуємо відстань

                    allPlaces.forEach(place => {

                        place.distance =
                            getDistance(
                                userLat,
                                userLng,
                                Number(place.lat),
                                Number(place.lng)
                            );

                    });


                    // сортуємо

                    const nearby =
                        [...allPlaces].sort(
                            (a, b) =>
                                a.distance -
                                b.distance
                        );


                    showPlaces(
                        nearby
                    );

                },

                error => {

                    console.error(
                        error
                    );


                    alert(
                        "📍 Дозвольте доступ до вашого місцезнаходження."
                    );

                }

            );

        }
    );

}


// =====================================================
// ВІДСТАНЬ
// =====================================================

function getDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;


    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

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