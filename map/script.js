// =====================================================
// RELAX VINNYTSIA — КАРТА
// =====================================================

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
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
    }
).addTo(map);


// =====================================================
// ЗМІННІ
// =====================================================

let allPlaces = [];
let markers = [];
let userMarker = null;


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

        console.log(
            "✅ Місця завантажені:",
            places
        );

        allPlaces = Array.isArray(places)
            ? places
            : [];

        showPlaces(allPlaces);

    })

    .catch(error => {

        console.error(
            "❌ ПОМИЛКА КАРТИ:",
            error
        );

        const mapElement =
            document.getElementById("map");

        if (mapElement) {

            mapElement.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    font-size:18px;
                    color:#c00;
                    background:white;
                ">
                    ❌ Не вдалося завантажити місця.
                    <br><br>
                    Перевірте файл places.json.
                </div>
            `;

        }

    });


// =====================================================
// ДОПОМОЖНІ ФУНКЦІЇ
// =====================================================

// Отримання координати
function getLatitude(place) {

    return Number(
        place.lat ??
        place.latitude ??
        place.Latitude
    );
}


function getLongitude(place) {

    return Number(
        place.lng ??
        place.lon ??
        place.longitude ??
        place.Longitude
    );
}


// Назва
function getPlaceName(place) {

    return (
        place.name ||
        place.title ||
        place["Назва"] ||
        "Без назви"
    );

}


// Місто
function getPlaceCity(place) {

    return (
        place.city ||
        place["Місто/СМТ"] ||
        ""
    );

}


// Адреса
function getPlaceAddress(place) {

    return (
        place.address ||
        place["Адреса"] ||
        ""
    );

}


// Телефон
function getPlacePhone(place) {

    return (
        place.phone ||
        place["Телефон"] ||
        ""
    );

}


// Ціна
function getPlacePrice(place) {

    return (
        place.price ||
        place["Ціна"] ||
        ""
    );

}


// Instagram
function getInstagram(place) {

    return (
        place.instagram ||
        place["Instagram"] ||
        ""
    );

}


// Google Maps
function getGoogleMaps(place) {

    return (
        place.maps ||
        place.googleMaps ||
        place["Google Maps"] ||
        ""
    );

}


// Перевірка "так"
function isYes(value) {

    if (value === undefined || value === null) {
        return false;
    }

    const text =
        String(value)
            .trim()
            .toLowerCase();

    return (
        text === "так" ||
        text === "є" ||
        text === "yes" ||
        text === "true" ||
        text === "1"
    );

}


// =====================================================
// ПОКАЗ МІСЦЬ
// =====================================================

function showPlaces(places) {

    // Видаляємо старі маркери

    markers.forEach(marker => {

        map.removeLayer(marker);

    });

    markers = [];


    // Якщо місць немає

    if (!places || places.length === 0) {

        console.log(
            "ℹ️ Місць для показу немає."
        );

        return;

    }


    // Додаємо маркери

    places.forEach(place => {

        const lat =
            getLatitude(place);

        const lng =
            getLongitude(place);


        // Перевіряємо координати

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {

            console.warn(
                "⚠️ Немає координат:",
                place
            );

            return;

        }


        // Створюємо маркер

        const marker =
            L.marker([
                lat,
                lng
            ]);


        marker.addTo(map);


        // =================================================
        // POPUP
        // =================================================

        const name =
            getPlaceName(place);

        const city =
            getPlaceCity(place);

        const address =
            getPlaceAddress(place);

        const phone =
            getPlacePhone(place);

        const price =
            getPlacePrice(place);

        const instagram =
            getInstagram(place);

        const maps =
            getGoogleMaps(place);


        let popup = `

            <div style="
                min-width:240px;
                max-width:300px;
                font-family:Arial,sans-serif;
            ">

                <h3 style="
                    margin:0 0 10px 0;
                    font-size:20px;
                    color:#1683d8;
                ">
                    ${name}
                </h3>

        `;


        // Місто

        if (city) {

            popup += `
                <div style="
                    margin:5px 0;
                ">
                    📍 ${city}
                </div>
            `;

        }


        // Адреса

        if (address) {

            popup += `
                <div style="
                    margin:5px 0;
                ">
                    📌 ${address}
                </div>
            `;

        }


        // Ціна

        if (price) {

            popup += `
                <div style="
                    margin:5px 0;
                ">
                    💰 ${price}
                </div>
            `;

        }


        // Телефон

        if (phone) {

            popup += `
                <div style="
                    margin:5px 0;
                ">
                    📞 ${phone}
                </div>
            `;

        }


        // =================================================
        // ВІДСТАНЬ
        // =================================================

        if (
            place.distance !== undefined &&
            Number.isFinite(place.distance)
        ) {

            popup += `

                <div style="
                    margin-top:10px;
                    padding:8px;
                    background:#e8f5e9;
                    border-radius:8px;
                    color:#16833a;
                    font-weight:bold;
                ">
                    📍 Відстань:
                    ${place.distance.toFixed(1)} км
                </div>

            `;

        }


        // =================================================
        // КНОПКИ
        // =================================================

        if (instagram) {

            popup += `

                <div style="
                    margin-top:10px;
                ">

                    <a
                        href="${instagram}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            text-decoration:none;
                            font-weight:bold;
                        "
                    >
                        📷 Instagram
                    </a>

                </div>

            `;

        }


        if (maps) {

            popup += `

                <div style="
                    margin-top:8px;
                ">

                    <a
                        href="${maps}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            text-decoration:none;
                            font-weight:bold;
                        "
                    >
                        📍 Google Maps
                    </a>

                </div>

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

                // Активна кнопка

                document
                    .querySelectorAll(
                        "#filters button"
                    )
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


                console.log(
                    "🔎 Фільтр:",
                    filter
                );


                // =================================================
                // ВСІ
                // =================================================

                if (filter === "all") {

                    showPlaces(
                        allPlaces
                    );

                    return;

                }


                // =================================================
                // ФІЛЬТР
                // =================================================

                const filtered =
                    allPlaces.filter(
                        place => {

                            return checkFilter(
                                place,
                                filter
                            );

                        }
                    );


                console.log(
                    "Знайдено:",
                    filtered.length
                );


                showPlaces(
                    filtered
                );

            }
        );

    });


// =====================================================
// ПЕРЕВІРКА ФІЛЬТРА
// =====================================================

function checkFilter(place, filter) {

    switch (filter) {

        case "pool":

            return (
                isYes(place.pool) ||
                isYes(place["Басейн"]) ||
                isYes(place["Басейн сезонний"]) ||
                isYes(place["Басейн цілорічний"])
            );


        case "chan":

            return (
                isYes(place.chan) ||
                isYes(place["Чан"])
            );


        case "fishing":

            return (
                isYes(place.fishing) ||
                isYes(place["Рибалка"])
            );


        case "gazebo":

            return (
                isYes(place.gazebo) ||
                isYes(place["Альтанка"])
            );


        case "house":

            return (
                isYes(place.house) ||
                isYes(place["Будинок"])
            );


        case "sauna":

            return (
                isYes(place.sauna) ||
                isYes(place["Сауна/Баня"])
            );


        default:

            return false;

    }

}


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

            console.log(
                "📍 Натиснуто Поруч зі мною"
            );


            // Перевірка геолокації

            if (!navigator.geolocation) {

                alert(
                    "Ваш браузер не підтримує геолокацію."
                );

                return;

            }


            // Змінюємо кнопку

            nearMeButton.disabled = true;

            nearMeButton.innerHTML =
                "📍 Визначаю місцезнаходження...";


            navigator.geolocation.getCurrentPosition(

                position => {

                    const userLat =
                        position.coords.latitude;

                    const userLng =
                        position.coords.longitude;


                    console.log(
                        "📍 Моє місцезнаходження:",
                        userLat,
                        userLng
                    );


                    // =================================================
                    // МАРКЕР КОРИСТУВАЧА
                    // =================================================

                    if (userMarker) {

                        map.removeLayer(
                            userMarker
                        );

                    }


                    userMarker =
                        L.marker([
                            userLat,
                            userLng
                        ])
                        .addTo(map)
                        .bindPopup(
                            "📍 Ви знаходитесь тут"
                        );


                    // Центруємо карту

                    map.setView(
                        [
                            userLat,
                            userLng
                        ],
                        12
                    );


                    // =================================================
                    // РАХУЄМО ВІДСТАНЬ
                    // =================================================

                    allPlaces.forEach(
                        place => {

                            const lat =
                                getLatitude(
                                    place
                                );

                            const lng =
                                getLongitude(
                                    place
                                );


                            if (
                                Number.isFinite(lat) &&
                                Number.isFinite(lng)
                            ) {

                                place.distance =
                                    getDistance(
                                        userLat,
                                        userLng,
                                        lat,
                                        lng
                                    );

                            } else {

                                place.distance =
                                    Infinity;

                            }

                        }
                    );


                    // =================================================
                    // СОРТУЄМО
                    // =================================================

                    const nearby =
                        [...allPlaces]
                            .filter(
                                place =>
                                    Number.isFinite(
                                        place.distance
                                    )
                            )
                            .sort(
                                (a, b) =>
                                    a.distance -
                                    b.distance
                            );


                    console.log(
                        "📍 Відсортовані місця:",
                        nearby
                    );


                    // =================================================
                    // ПОКАЗУЄМО НА КАРТІ
                    // =================================================

                    showPlaces(
                        nearby
                    );


                    // =================================================
                    // НАЙБЛИЖЧЕ МІСЦЕ
                    // =================================================

                    if (
                        nearby.length > 0
                    ) {

                        const nearest =
                            nearby[0];


                        console.log(
                            "⭐ Найближче:",
                            nearest
                        );


                        showNearestPlace(
                            nearest
                        );


                    } else {

                        hideNearestPlace();

                        alert(
                            "Місць з правильними координатами не знайдено."
                        );

                    }


                    // Повертаємо кнопку

                    nearMeButton.disabled =
                        false;

                    nearMeButton.innerHTML =
                        "📍 Поруч зі мною";

                },


                error => {

                    console.error(
                        "❌ Геолокація:",
                        error
                    );


                    nearMeButton.disabled =
                        false;

                    nearMeButton.innerHTML =
                        "📍 Поруч зі мною";


                    if (
                        error.code === 1
                    ) {

                        alert(
                            "📍 Дозвольте доступ до вашого місцезнаходження."
                        );

                    } else {

                        alert(
                            "📍 Не вдалося визначити ваше місцезнаходження."
                        );

                    }

                },


                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }

            );

        }
    );

}


// =====================================================
// НАЙБЛИЖЧЕ МІСЦЕ
// =====================================================

function showNearestPlace(place) {

    let box =
        document.getElementById(
            "nearestPlace"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.id =
            "nearestPlace";


        document.body.appendChild(
            box
        );

    }


    box.innerHTML = `

        <div style="
            font-size:13px;
            margin-bottom:4px;
        ">
            ⭐ Найближче місце
        </div>

        <div style="
            font-size:18px;
            font-weight:bold;
        ">
            ${getPlaceName(place)}
        </div>

        <div style="
            margin-top:5px;
            font-size:16px;
        ">
            📍 ${place.distance.toFixed(1)} км
        </div>

    `;


    box.style.display =
        "block";


    // Натискання на блок

    box.onclick = () => {

        const lat =
            getLatitude(place);

        const lng =
            getLongitude(place);


        map.setView(
            [lat, lng],
            14
        );


        // Знаходимо відповідний маркер

        const index =
            allPlaces.indexOf(
                place
            );


        if (
            index >= 0 &&
            markers[index]
        ) {

            markers[index]
                .openPopup();

        }

    };

}


// =====================================================
// СХОВАТИ НАЙБЛИЖЧЕ
// =====================================================

function hideNearestPlace() {

    const box =
        document.getElementById(
            "nearestPlace"
        );


    if (box) {

        box.style.display =
            "none";

    }

}


// =====================================================
// ВІДСТАНЬ МІЖ ДВОМА ТОЧКАМИ
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
        Math.PI /
        180;


    const dLon =
        (lon2 - lon1) *
        Math.PI /
        180;


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


// =====================================================
// КІНЕЦЬ
// =====================================================

console.log(
    "✅ Relax Vinnytsia карта запущена"
);