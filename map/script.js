// ============================================================
// RELAX VINNYTSIA — КАРТА
// ============================================================

console.log("🚀 Relax Vinnytsia map запускається...");


// ============================================================
// НАЛАШТУВАННЯ КАРТИ
// ============================================================

const map = L.map("map").setView(
    [49.2328, 28.48097],
    10
);


// ============================================================
// OPEN STREET MAP
// ============================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
    }
).addTo(map);


// ============================================================
// ЗМІННІ
// ============================================================

let allPlaces = [];

let markers = [];

let userMarker = null;

let nearbyMode = false;

let userLatitude = null;

let userLongitude = null;


// ============================================================
// DOM
// ============================================================

const nearMeButton = document.getElementById(
    "nearMeButton"
);


// ============================================================
// ЗАВАНТАЖЕННЯ PLACES.JSON
// ============================================================

async function loadPlaces() {

    console.log("📂 Завантажую places.json...");

    try {

        const response = await fetch(
            "./places.json?" + Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );
        }

        const places = await response.json();

        if (!Array.isArray(places)) {

            throw new Error(
                "places.json має бути масивом"
            );
        }

        allPlaces = places;

        console.log(
            "✅ places.json завантажено"
        );

        console.log(
            "📌 Кількість записів:",
            allPlaces.length
        );

        showPlaces(allPlaces);

    } catch (error) {

        console.error(
            "❌ Помилка завантаження places.json:",
            error
        );

        alert(
            "❌ Не вдалося завантажити місця.\n\n" +
            "Перевірте файл places.json."
        );
    }
}


// ============================================================
// ПОКАЗ МІСЦЬ
// ============================================================

function showPlaces(places) {

    console.log(
        "📍 Показую місця:",
        places.length
    );


    // --------------------------------------------------------
    // Видаляємо старі маркери
    // --------------------------------------------------------

    markers.forEach(marker => {

        try {

            map.removeLayer(marker);

        } catch (error) {

            console.warn(
                "Помилка видалення маркера:",
                error
            );
        }
    });


    markers = [];


    // --------------------------------------------------------
    // Додаємо нові маркери
    // --------------------------------------------------------

    places.forEach((place, index) => {

        const lat = Number(place.lat);

        const lng = Number(place.lng);


        // ----------------------------------------------------
        // Перевірка координат
        // ----------------------------------------------------

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {

            console.warn(
                "⚠️ Пропускаю місце без правильних координат:",
                place
            );

            return;
        }


        // ----------------------------------------------------
        // Створюємо маркер
        // ----------------------------------------------------

        const marker = L.marker(
            [lat, lng]
        );


        marker.addTo(map);


        // ----------------------------------------------------
        // Відстань
        // ----------------------------------------------------

        let distanceBlock = "";


        if (
            nearbyMode &&
            place.distance !== undefined &&
            Number.isFinite(
                Number(place.distance)
            )
        ) {

            const distance =
                Number(place.distance);


            let distanceColor =
                "#198754";


            let distanceText =
                distance.toFixed(1) +
                " км";


            if (distance < 1) {

                distanceColor =
                    "#198754";

                distanceText =
                    Math.round(
                        distance * 1000
                    ) +
                    " м";

            } else if (distance < 5) {

                distanceColor =
                    "#198754";

            } else if (distance < 15) {

                distanceColor =
                    "#f59e0b";

            } else {

                distanceColor =
                    "#dc3545";
            }


            distanceBlock = `
                <div style="
                    margin-top:12px;
                    padding:9px 12px;
                    background:${distanceColor};
                    color:white;
                    border-radius:12px;
                    text-align:center;
                    font-size:16px;
                    font-weight:bold;
                ">
                    📏 ${distanceText} від вас
                </div>
            `;
        }


        // ----------------------------------------------------
        // Найближче місце
        // ----------------------------------------------------

        let nearestBlock = "";


        if (
            nearbyMode &&
            places.length > 0 &&
            places[0] === place
        ) {

            nearestBlock = `
                <div style="
                    margin-bottom:10px;
                    padding:7px 10px;
                    background:#fff3cd;
                    color:#856404;
                    border-radius:10px;
                    text-align:center;
                    font-weight:bold;
                ">
                    🥇 Найближче місце
                </div>
            `;
        }


        // ----------------------------------------------------
        // Назва
        // ----------------------------------------------------

        const name =
            escapeHtml(
                place.name ||
                "Без назви"
            );


        // ----------------------------------------------------
        // Місто
        // ----------------------------------------------------

        const city =
            place.city
                ? `
                    <div style="margin-top:5px;">
                        📍 ${escapeHtml(place.city)}
                    </div>
                  `
                : "";


        // ----------------------------------------------------
        // Адреса
        // ----------------------------------------------------

        const address =
            place.address
                ? `
                    <div style="margin-top:5px;">
                        📌 ${escapeHtml(place.address)}
                    </div>
                  `
                : "";


        // ----------------------------------------------------
        // Ціна
        // ----------------------------------------------------

        const price =
            place.price
                ? `
                    <div style="
                        margin-top:7px;
                        font-weight:bold;
                    ">
                        💰 ${escapeHtml(place.price)}
                    </div>
                  `
                : "";


        // ----------------------------------------------------
        // Телефон
        // ----------------------------------------------------

        const phone =
            place.phone
                ? `
                    <div style="margin-top:7px;">
                        📞 ${escapeHtml(place.phone)}
                    </div>
                  `
                : "";


        // ----------------------------------------------------
        // Instagram
        // ----------------------------------------------------

        let instagram = "";


        if (place.instagram) {

            instagram = `
                <div style="margin-top:12px;">
                    <a
                        href="${escapeAttribute(place.instagram)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            text-decoration:none;
                            font-weight:bold;
                            color:#c13584;
                        "
                    >
                        📷 Instagram
                    </a>
                </div>
            `;
        }


        // ----------------------------------------------------
        // Google Maps
        // ----------------------------------------------------

        let googleMaps = "";


        if (place.maps) {

            googleMaps = `
                <div style="margin-top:8px;">
                    <a
                        href="${escapeAttribute(place.maps)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            text-decoration:none;
                            font-weight:bold;
                            color:#1976d2;
                        "
                    >
                        📍 Google Maps
                    </a>
                </div>
            `;
        }


        // ----------------------------------------------------
        // POPUP
        // ----------------------------------------------------

        const popup = `

            <div style="
                min-width:240px;
                max-width:300px;
                font-family:Arial,sans-serif;
                line-height:1.4;
            ">

                ${nearestBlock}

                <h3 style="
                    margin:0 0 10px 0;
                    color:#1976d2;
                    font-size:20px;
                ">
                    ${name}
                </h3>

                ${city}

                ${address}

                ${price}

                ${phone}

                ${distanceBlock}

                ${instagram}

                ${googleMaps}

            </div>

        `;


        marker.bindPopup(
            popup
        );


        // ----------------------------------------------------
        // Зберігаємо маркер
        // ----------------------------------------------------

        markers.push(
            marker
        );

    });


    console.log(
        "📌 Маркерів на карті:",
        markers.length
    );
}


// ============================================================
// ФІЛЬТРИ
// ============================================================

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            "#filters button"
        );


    if (!buttons.length) {

        console.warn(
            "⚠️ Кнопки фільтрів не знайдені."
        );

        return;
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                // --------------------------------------------
                // Прибираємо active
                // --------------------------------------------

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );
                });


                // --------------------------------------------
                // Активна кнопка
                // --------------------------------------------

                button.classList.add(
                    "active"
                );


                // --------------------------------------------
                // Виходимо з режиму "поруч"
                // --------------------------------------------

                nearbyMode = false;


                // --------------------------------------------
                // Фільтр
                // --------------------------------------------

                const filter =
                    button.dataset.filter;


                console.log(
                    "🔎 Фільтр:",
                    filter
                );


                // --------------------------------------------
                // Всі
                // --------------------------------------------

                if (
                    !filter ||
                    filter === "all"
                ) {

                    showPlaces(
                        allPlaces
                    );

                    return;
                }


                // --------------------------------------------
                // Фільтрація
                // --------------------------------------------

                const filtered =
                    allPlaces.filter(
                        place => {

                            return isYes(
                                place[filter]
                            );
                        }
                    );


                console.log(
                    "🔎 Знайдено:",
                    filtered.length
                );


                showPlaces(
                    filtered
                );

            }
        );

    });
}


// ============================================================
// ПЕРЕВІРКА "ТАК"
// ============================================================

function isYes(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return false;
    }


    const normalized =
        String(value)
            .trim()
            .toLowerCase();


    return (
        normalized === "так" ||
        normalized === "є" ||
        normalized === "yes" ||
        normalized === "true" ||
        normalized === "1"
    );
}


// ============================================================
// ПОРУЧ ЗІ МНОЮ
// ============================================================

function setupNearMe() {

    if (!nearMeButton) {

        console.warn(
            "⚠️ Кнопка nearMeButton не знайдена."
        );

        return;
    }


    nearMeButton.addEventListener(
        "click",
        findNearbyPlaces
    );
}


// ============================================================
// ПОШУК МІСЦЬ ПОРУЧ
// ============================================================

function findNearbyPlaces() {

    console.log(
        "📍 Запит геолокації..."
    );


    // --------------------------------------------------------
    // Перевірка підтримки
    // --------------------------------------------------------

    if (
        !navigator.geolocation
    ) {

        alert(
            "❌ Ваш браузер не підтримує геолокацію."
        );

        return;
    }


    // --------------------------------------------------------
    // Змінюємо текст кнопки
    // --------------------------------------------------------

    const oldText =
        nearMeButton.innerHTML;


    nearMeButton.innerHTML =
        "📍 Визначаю місцезнаходження...";


    nearMeButton.disabled =
        true;


    // --------------------------------------------------------
    // Геолокація
    // --------------------------------------------------------

    navigator.geolocation.getCurrentPosition(

        position => {

            // ----------------------------------------------
            // Координати
            // ----------------------------------------------

            userLatitude =
                position.coords.latitude;


            userLongitude =
                position.coords.longitude;


            console.log(
                "📍 Ваша позиція:",
                userLatitude,
                userLongitude
            );


            // ----------------------------------------------
            // Показуємо користувача
            // ----------------------------------------------

            showUserPosition(
                userLatitude,
                userLongitude
            );


            // ----------------------------------------------
            // Розрахунок відстані
            // ----------------------------------------------

            const nearby =
                allPlaces

                    .map(place => {

                        const lat =
                            Number(place.lat);

                        const lng =
                            Number(place.lng);


                        if (
                            !Number.isFinite(lat) ||
                            !Number.isFinite(lng)
                        ) {

                            return null;
                        }


                        const distance =
                            getDistance(
                                userLatitude,
                                userLongitude,
                                lat,
                                lng
                            );


                        return {
                            ...place,
                            distance:
                                distance
                        };

                    })

                    .filter(
                        place =>
                            place !== null
                    )

                    .sort(
                        (a, b) =>
                            a.distance -
                            b.distance
                    );


            console.log(
                "📍 Місця поруч:",
                nearby
            );


            // ----------------------------------------------
            // Режим поруч
            // ----------------------------------------------

            nearbyMode =
                true;


            // ----------------------------------------------
            // Показуємо місця
            // ----------------------------------------------

            showPlaces(
                nearby
            );


            // ----------------------------------------------
            // Центруємо карту
            // ----------------------------------------------

            map.setView(
                [
                    userLatitude,
                    userLongitude
                ],
                12
            );


            // ----------------------------------------------
            // Відкриваємо найближче місце
            // ----------------------------------------------

            if (
                nearby.length > 0
            ) {

                const nearest =
                    nearby[0];


                console.log(
                    "🥇 Найближче:",
                    nearest.name,
                    nearest.distance.toFixed(2),
                    "км"
                );


                // Знаходимо маркер
                // найближчого місця

                const nearestIndex =
                    nearby.findIndex(
                        place =>
                            place === nearest
                    );


                if (
                    markers[
                        nearestIndex
                    ]
                ) {

                    setTimeout(
                        () => {

                            markers[
                                nearestIndex
                            ].openPopup();

                        },
                        500
                    );
                }

            }


            // ----------------------------------------------
            // Повертаємо кнопку
            // ----------------------------------------------

            nearMeButton.innerHTML =
                oldText;

            nearMeButton.disabled =
                false;

        },


        // ====================================================
        // ПОМИЛКА
        // ====================================================

        error => {

            console.error(
                "❌ Геолокація:",
                error
            );


            let message =
                "❌ Не вдалося визначити ваше місцезнаходження.";


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                message =
                    "📍 Доступ до геолокації заборонено.\n\n" +
                    "Дозвольте браузеру доступ до вашого місцезнаходження.";
            }


            if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                message =
                    "📍 Місцезнаходження зараз недоступне.";
            }


            if (
                error.code ===
                error.TIMEOUT
            ) {

                message =
                    "📍 Час очікування геолокації вичерпано.";
            }


            alert(
                message
            );


            nearMeButton.innerHTML =
                oldText;

            nearMeButton.disabled =
                false;

        },


        // ====================================================
        // НАЛАШТУВАННЯ
        // ====================================================

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0
        }

    );
}


// ============================================================
// ПОЗИЦІЯ КОРИСТУВАЧА
// ============================================================

function showUserPosition(
    lat,
    lng
) {

    // Видаляємо старий маркер

    if (
        userMarker
    ) {

        map.removeLayer(
            userMarker
        );

        userMarker =
            null;
    }


    // Створюємо новий

    userMarker =
        L.marker(
            [lat, lng]
        );


    userMarker
        .addTo(map)
        .bindPopup(
            `
            <div style="
                text-align:center;
                font-size:16px;
            ">
                📍 <b>Ви знаходитесь тут</b>
            </div>
            `
        );

}


// ============================================================
// ВІДСТАНЬ МІЖ ДВОМА ТОЧКАМИ
// ============================================================

function getDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R =
        6371;


    const dLat =
        (
            lat2 -
            lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 -
            lon1
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            dLat / 2
        ) *
        Math.sin(
            dLat / 2
        )

        +

        Math.cos(
            lat1 *
            Math.PI /
            180
        )

        *

        Math.cos(
            lat2 *
            Math.PI /
            180
        )

        *

        Math.sin(
            dLon / 2
        ) *
        Math.sin(
            dLon / 2
        );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


// ============================================================
// БЕЗПЕЧНИЙ HTML
// ============================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// БЕЗПЕЧНИЙ URL
// ============================================================

function escapeAttribute(value) {

    return String(value)
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// ЗАПУСК
// ============================================================

function initMap() {

    console.log(
        "🚀 Ініціалізація карти..."
    );


    setupFilters();

    setupNearMe();

    loadPlaces();


    console.log(
        "✅ Relax Vinnytsia map готова"
    );
}


// ============================================================
// START
// ============================================================

initMap();