// =====================================================
// RELAX VINNYTSIA — КАРТА
// =====================================================

// -------------------------
// Створення карти
// -------------------------

const map = L.map("map").setView(
    [49.2328, 28.48097],
    10
);


// -------------------------
// OpenStreetMap
// -------------------------

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


// =====================================================
// ДОПОМІЖНІ ФУНКЦІЇ
// =====================================================

// Безпечне відображення тексту
function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Перевірка значення "так"
function isYes(value) {

    const text = String(value || "")
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


// Очищення номера для tel:
function cleanPhone(phone) {

    return String(phone || "")
        .replace(/[^\d+]/g, "");
}


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
            places.length
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

        alert(
            "Не вдалося завантажити місця."
        );
    });


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

        const lat = Number(place.lat);
        const lng = Number(place.lng);


        // Перевіряємо координати

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {

            console.warn(
                "⚠️ Неправильні координати:",
                place
            );

            return;
        }


        // ---------------------------------------------
        // Назва
        // ---------------------------------------------

        const name =
            escapeHtml(
                place.name || "Без назви"
            );


        // ---------------------------------------------
        // Місто
        // ---------------------------------------------

        const city =
            place.city
                ? `
                    <div style="margin-top:6px;">
                        📍 ${escapeHtml(place.city)}
                    </div>
                  `
                : "";


        // ---------------------------------------------
        // Адреса
        // ---------------------------------------------

        const address =
            place.address
                ? `
                    <div style="margin-top:6px;">
                        📌 ${escapeHtml(place.address)}
                    </div>
                  `
                : "";


        // ---------------------------------------------
        // Ціна
        // ---------------------------------------------

        const price =
            place.price
                ? `
                    <div style="margin-top:6px;">
                        💰 ${escapeHtml(place.price)}
                    </div>
                  `
                : "";


        // ---------------------------------------------
        // Телефон
        // ---------------------------------------------

        let phone = "";

        if (place.phone) {

            const phoneNumber =
                cleanPhone(place.phone);

            phone = `
                <div style="margin-top:12px;">

                    <a
                        href="tel:${phoneNumber}"
                        style="
                            display:block;
                            width:100%;
                            box-sizing:border-box;
                            padding:11px 10px;
                            background:#198754;
                            color:white;
                            text-align:center;
                            text-decoration:none;
                            border-radius:10px;
                            font-weight:bold;
                            font-size:16px;
                        "
                    >
                        📞 Подзвонити
                    </a>

                </div>
            `;
        }


        // ---------------------------------------------
        // Instagram
        // ---------------------------------------------

        let instagram = "";

        if (place.instagram) {

            instagram = `
                <a
                    href="${escapeHtml(place.instagram)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        display:block;
                        width:100%;
                        box-sizing:border-box;
                        margin-top:8px;
                        padding:10px;
                        background:#e1306c;
                        color:white;
                        text-align:center;
                        text-decoration:none;
                        border-radius:10px;
                        font-weight:bold;
                    "
                >
                    📷 Instagram
                </a>
            `;
        }


        // ---------------------------------------------
        // Google Maps
        // ---------------------------------------------

        let googleMaps = "";

        if (place.maps) {

            googleMaps = `
                <a
                    href="${escapeHtml(place.maps)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        display:block;
                        width:100%;
                        box-sizing:border-box;
                        margin-top:8px;
                        padding:10px;
                        background:#4285f4;
                        color:white;
                        text-align:center;
                        text-decoration:none;
                        border-radius:10px;
                        font-weight:bold;
                    "
                >
                    📍 Google Maps
                </a>
            `;
        }


        // ---------------------------------------------
        // Відстань
        // ---------------------------------------------

        let distance = "";

        if (
            place.distance !== undefined &&
            Number.isFinite(
                Number(place.distance)
            )
        ) {

            distance = `
                <div
                    style="
                        margin-top:8px;
                        font-weight:bold;
                    "
                >
                    🚗 ${Number(
                        place.distance
                    ).toFixed(1)} км від вас
                </div>
            `;
        }


        // ---------------------------------------------
        // Popup
        // ---------------------------------------------

        const popup = `

            <div
                style="
                    min-width:230px;
                    max-width:280px;
                    font-family:Arial,sans-serif;
                "
            >

                <div
                    style="
                        font-size:18px;
                        font-weight:bold;
                        margin-bottom:8px;
                    "
                >
                    ${name}
                </div>

                ${city}

                ${address}

                ${price}

                ${distance}

                ${phone}

                ${instagram}

                ${googleMaps}

            </div>

        `;


        // ---------------------------------------------
        // Маркер
        // ---------------------------------------------

        const marker =
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(popup);


        markers.push(marker);

    });
}


// =====================================================
// ФІЛЬТРИ
// =====================================================

const filterButtons =
    document.querySelectorAll(
        "#filters button"
    );


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            // Прибираємо active

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            // Робимо кнопку активною

            button.classList.add(
                "active"
            );


            const filter =
                button.dataset.filter;


            // -------------------------
            // Всі місця
            // -------------------------

            if (filter === "all") {

                showPlaces(allPlaces);

                return;
            }


            // -------------------------
            // Фільтрація
            // -------------------------

            const filtered =
                allPlaces.filter(place => {

                    return isYes(
                        place[filter]
                    );

                });


            console.log(
                "Фільтр:",
                filter,
                "Знайдено:",
                filtered.length
            );


            showPlaces(filtered);

        }
    );

});


// =====================================================
// КНОПКА "ВСІ"
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
// ПОКАЗ ПОЗИЦІЇ КОРИСТУВАЧА
// =====================================================

let userMarker = null;


// =====================================================
// КНОПКА "ПОРУЧ ЗІ МНОЮ"
// =====================================================

const nearMeButton =
    document.getElementById(
        "nearMeButton"
    );


if (nearMeButton) {

    nearMeButton.addEventListener(
        "click",
        () => {

            // Перевіряємо геолокацію

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Ваш браузер не підтримує визначення місцезнаходження."
                );

                return;
            }


            // Отримуємо позицію

            navigator.geolocation.getCurrentPosition(

                position => {

                    const userLat =
                        position.coords.latitude;

                    const userLng =
                        position.coords.longitude;


                    console.log(
                        "📍 Ваша позиція:",
                        userLat,
                        userLng
                    );


                    // Видаляємо старий маркер

                    if (userMarker) {

                        map.removeLayer(
                            userMarker
                        );
                    }


                    // Створюємо новий

                    userMarker =
                        L.marker([
                            userLat,
                            userLng
                        ])
                        .addTo(map)
                        .bindPopup(
                            "📍 Ви знаходитесь тут"
                        );


                    userMarker.openPopup();


                    // Центруємо карту

                    map.setView(
                        [
                            userLat,
                            userLng
                        ],
                        12
                    );


                    // ---------------------------------
                    // Рахуємо відстань
                    // ---------------------------------

                    allPlaces.forEach(place => {

                        const lat =
                            Number(place.lat);

                        const lng =
                            Number(place.lng);


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
                        }

                    });


                    // ---------------------------------
                    // Сортуємо
                    // ---------------------------------

                    const nearby =
                        [...allPlaces]
                            .filter(place =>
                                Number.isFinite(
                                    Number(place.distance)
                                )
                            )
                            .sort(
                                (a, b) =>
                                    a.distance -
                                    b.distance
                            );


                    // Показуємо всі місця,
                    // але відсортовані від найближчого

                    showPlaces(nearby);


                    // ---------------------------------
                    // Найближче місце
                    // ---------------------------------

                    if (
                        nearby.length > 0
                    ) {

                        const nearest =
                            nearby[0];


                        const distance =
                            Number(
                                nearest.distance
                            ).toFixed(1);


                        alert(
                            "📍 Найближче місце:\n\n" +
                            nearest.name +
                            "\n\n" +
                            distance +
                            " км від вас"
                        );

                    } else {

                        alert(
                            "Не вдалося знайти місця поблизу."
                        );

                    }

                },


                error => {

                    console.error(
                        "Помилка геолокації:",
                        error
                    );


                    if (
                        error.code === 1
                    ) {

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
                    maximumAge: 60000
                }

            );

        }
    );

}


// =====================================================
// РОЗРАХУНОК ВІДСТАНІ
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
        )
        *
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


// =====================================================
// ГОТОВО
// =====================================================

console.log(
    "✅ Relax Vinnytsia карта запущена"
);