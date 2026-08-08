// =====================================================
// RELAX VINNYTSIA — КАРТА
// =====================================================

console.log("🚀 Relax Vinnytsia map запускається...");

// =====================================================
// КАРТА
// =====================================================

const map = L.map("map").setView(
    [49.2328, 28.48097],
    10
);

// =====================================================
// OPEN STREET MAP
// =====================================================

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
// ДОПОМІЖНІ ФУНКЦІЇ
// =====================================================

// Отримати значення з різних можливих назв поля
function getValue(place, names) {

    for (const name of names) {

        if (
            place[name] !== undefined &&
            place[name] !== null &&
            String(place[name]).trim() !== ""
        ) {
            return place[name];
        }
    }

    return "";
}


// =====================================================
// КООРДИНАТИ
// =====================================================

function getLat(place) {

    return Number(
        getValue(place, [
            "lat",
            "latitude",
            "Latitude",
            "LAT",
            "Широта",
            "широта"
        ])
    );
}


function getLng(place) {

    return Number(
        getValue(place, [
            "lng",
            "lon",
            "longitude",
            "Longitude",
            "LNG",
            "Довгота",
            "довгота"
        ])
    );
}


// =====================================================
// НАЗВА
// =====================================================

function getName(place) {

    return getValue(place, [
        "name",
        "Назва",
        "назва",
        "title",
        "Title"
    ]) || "Місце відпочинку";
}


// =====================================================
// МІСТО
// =====================================================

function getCity(place) {

    return getValue(place, [
        "city",
        "Місто/СМТ",
        "Місто",
        "місто",
        "СМТ"
    ]);
}


// =====================================================
// АДРЕСА
// =====================================================

function getAddress(place) {

    return getValue(place, [
        "address",
        "Адреса",
        "адреса"
    ]);
}


// =====================================================
// ТЕЛЕФОН
// =====================================================

function getPhone(place) {

    return getValue(place, [
        "phone",
        "Телефон",
        "телефон"
    ]);
}


// =====================================================
// ЦІНА
// =====================================================

function getPrice(place) {

    return getValue(place, [
        "price",
        "Ціна",
        "ціна"
    ]);
}


// =====================================================
// INSTAGRAM
// =====================================================

function getInstagram(place) {

    return getValue(place, [
        "instagram",
        "Instagram",
        "інстаграм"
    ]);
}


// =====================================================
// GOOGLE MAPS
// =====================================================

function getGoogleMaps(place) {

    return getValue(place, [
        "maps",
        "Google Maps",
        "GoogleMaps",
        "google_maps",
        "googleMaps"
    ]);
}


// =====================================================
// ПЕРЕВІРКА "ТАК"
// =====================================================

function isYes(value) {

    if (value === undefined || value === null) {
        return false;
    }

    const text = String(value)
        .trim()
        .toLowerCase();

    return (
        text === "так" ||
        text === "є" ||
        text === "yes" ||
        text === "true" ||
        text === "1" ||
        text === "✔" ||
        text === "+"
    );
}


// =====================================================
// ФІЛЬТРИ
// =====================================================

function hasFeature(place, filter) {

    switch (filter) {

        case "pool":
            return (
                isYes(getValue(place, [
                    "pool",
                    "Басейн"
                ]))
                ||
                isYes(getValue(place, [
                    "Басейн сезонний"
                ]))
                ||
                isYes(getValue(place, [
                    "Басейн цілорічний"
                ]))
            );


        case "chan":
            return isYes(
                getValue(place, [
                    "chan",
                    "Чан"
                ])
            );


        case "fishing":
            return isYes(
                getValue(place, [
                    "fishing",
                    "Рибалка"
                ])
            );


        case "gazebo":
            return isYes(
                getValue(place, [
                    "gazebo",
                    "Альтанка"
                ])
            );


        case "house":
            return isYes(
                getValue(place, [
                    "house",
                    "Будинок"
                ])
            );


        case "sauna":
            return (
                isYes(getValue(place, [
                    "sauna",
                    "Сауна",
                    "Сауна/Баня"
                ]))
            );


        case "seasonal":
            return isYes(
                getValue(place, [
                    "Басейн сезонний",
                    "seasonal_pool"
                ])
            );


        case "yearround":
            return isYes(
                getValue(place, [
                    "Басейн цілорічний",
                    "year_round_pool"
                ])
            );


        case "two":
            return isYes(
                getValue(place, [
                    "Для двох",
                    "for_two"
                ])
            );


        case "company":
            return isYes(
                getValue(place, [
                    "Для компанії",
                    "for_company"
                ])
            );


        default:
            return false;
    }
}


// =====================================================
// ЗАВАНТАЖЕННЯ PLACES.JSON
// =====================================================

async function loadPlaces() {

    console.log("📂 Завантажую places.json...");

    try {

        const response = await fetch("./places.json", {
            cache: "no-store"
        });


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} — places.json не знайдено`
            );
        }


        const data = await response.json();


        console.log("✅ places.json завантажено");
        console.log("📍 Кількість записів:", data.length);


        if (!Array.isArray(data)) {

            throw new Error(
                "places.json має бути масивом []"
            );
        }


        allPlaces = data;


        // показуємо всі місця

        showPlaces(allPlaces);


        // після завантаження оновлюємо карту

        setTimeout(() => {
            map.invalidateSize();
        }, 300);


    } catch (error) {

        console.error(
            "❌ ПОМИЛКА ЗАВАНТАЖЕННЯ:",
            error
        );


        showMapError(
            "Не вдалося завантажити places.json"
        );
    }
}


// =====================================================
// ПОКАЗ ПОМИЛКИ
// =====================================================

function showMapError(message) {

    const errorBox =
        document.createElement("div");

    errorBox.style.position = "absolute";
    errorBox.style.top = "20px";
    errorBox.style.left = "50%";
    errorBox.style.transform = "translateX(-50%)";
    errorBox.style.zIndex = "9999";
    errorBox.style.background = "white";
    errorBox.style.color = "#b00020";
    errorBox.style.padding = "15px 20px";
    errorBox.style.borderRadius = "10px";
    errorBox.style.boxShadow =
        "0 3px 15px rgba(0,0,0,0.3)";
    errorBox.style.fontWeight = "bold";

    errorBox.innerHTML =
        "⚠️ " + message;

    document.body.appendChild(errorBox);
}


// =====================================================
// ПОКАЗ МІСЦЬ НА КАРТІ
// =====================================================

function showPlaces(places) {

    console.log(
        "🗺 Показую місця:",
        places.length
    );


    // видаляємо старі маркери

    markers.forEach(marker => {

        map.removeLayer(marker);

    });


    markers = [];


    // додаємо нові

    places.forEach((place, index) => {

        const lat = getLat(place);
        const lng = getLng(place);


        // перевіряємо координати

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat === 0 ||
            lng === 0
        ) {

            console.warn(
                `⚠️ Місце №${index + 1} без координат:`,
                place
            );

            return;
        }


        const marker =
            L.marker([
                lat,
                lng
            ]);


        marker.addTo(map);


        // =================================================
        // ДАНІ
        // =================================================

        const name =
            getName(place);

        const city =
            getCity(place);

        const address =
            getAddress(place);

        const phone =
            getPhone(place);

        const price =
            getPrice(place);

        const instagram =
            getInstagram(place);

        const googleMaps =
            getGoogleMaps(place);


        // =================================================
        // POPUP
        // =================================================

        let popup = `
            <div style="
                min-width:220px;
                font-family:Arial,sans-serif;
                line-height:1.5;
            ">

                <h3 style="
                    margin-top:0;
                    margin-bottom:8px;
                ">
                    ${escapeHtml(name)}
                </h3>
        `;


        if (city) {

            popup += `
                📍 ${escapeHtml(city)}<br>
            `;
        }


        if (address) {

            popup += `
                📌 ${escapeHtml(address)}<br>
            `;
        }


        if (price) {

            popup += `
                💰 ${escapeHtml(price)}<br>
            `;
        }


        if (phone) {

            popup += `
                📞 ${escapeHtml(phone)}<br>
            `;
        }


        // =================================================
        // ПОСЛУГИ
        // =================================================

        const features = [];


        if (hasFeature(place, "pool")) {
            features.push("🏊 Басейн");
        }


        if (hasFeature(place, "gazebo")) {
            features.push("🏡 Альтанка");
        }


        if (hasFeature(place, "house")) {
            features.push("🏠 Будинок");
        }


        if (hasFeature(place, "chan")) {
            features.push("🛁 Чан");
        }


        if (hasFeature(place, "sauna")) {
            features.push("🧖 Сауна");
        }


        if (hasFeature(place, "fishing")) {
            features.push("🎣 Рибалка");
        }


        if (hasFeature(place, "two")) {
            features.push("❤️ Для двох");
        }


        if (hasFeature(place, "company")) {
            features.push("🥳 Для компанії");
        }


        if (features.length > 0) {

            popup += `
                <br>
                <b>✨ Є на території:</b><br>
                ${features.join("<br>")}
            `;
        }


        // =================================================
        // ПОСИЛАННЯ
        // =================================================

        if (instagram) {

            popup += `
                <br><br>
                <a
                    href="${safeUrl(instagram)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📷 Instagram
                </a>
            `;
        }


        if (googleMaps) {

            popup += `
                <br>
                <a
                    href="${safeUrl(googleMaps)}"
                    target="_blank"
                    rel="noopener noreferrer"
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


    console.log(
        "📌 Маркерів на карті:",
        markers.length
    );
}


// =====================================================
// ЗАХИСТ HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// БЕЗПЕЧНЕ ПОСИЛАННЯ
// =====================================================

function safeUrl(url) {

    return String(url).trim();
}


// =====================================================
// ФІЛЬТРИ КАРТИ
// =====================================================

const filterButtons =
    document.querySelectorAll(
        "#filters button"
    );


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            // активна кнопка

            filterButtons.forEach(btn => {

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


            // ВСІ

            if (filter === "all") {

                showPlaces(allPlaces);

                return;
            }


            // фільтрація

            const filtered =
                allPlaces.filter(place =>
                    hasFeature(
                        place,
                        filter
                    )
                );


            console.log(
                "🔎 Знайдено:",
                filtered.length
            );


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

            console.log(
                "📍 Запит геолокації..."
            );


            if (!navigator.geolocation) {

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


                    console.log(
                        "📍 Ваша позиція:",
                        userLat,
                        userLng
                    );


                    // видаляємо стару позицію

                    if (userMarker) {

                        map.removeLayer(
                            userMarker
                        );
                    }


                    // створюємо нову

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


                    // переміщуємо карту

                    map.setView(
                        [
                            userLat,
                            userLng
                        ],
                        12
                    );


                    // розрахунок відстані

                    const nearby =
                        allPlaces
                            .filter(place => {

                                const lat =
                                    getLat(place);

                                const lng =
                                    getLng(place);


                                return (
                                    Number.isFinite(lat) &&
                                    Number.isFinite(lng)
                                );

                            })
                            .map(place => {

                                const lat =
                                    getLat(place);

                                const lng =
                                    getLng(place);


                                return {
                                    ...place,
                                    distance:
                                        getDistance(
                                            userLat,
                                            userLng,
                                            lat,
                                            lng
                                        )
                                };

                            })
                            .sort(
                                (a, b) =>
                                    a.distance -
                                    b.distance
                            );


                    console.log(
                        "📍 Місця поруч:",
                        nearby
                    );


                    showPlaces(nearby);

                },


                error => {

                    console.error(
                        "❌ Геолокація:",
                        error
                    );


                    alert(
                        "📍 Не вдалося визначити ваше місцезнаходження. Дозвольте браузеру доступ до геолокації."
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
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


// =====================================================
// ЗАПУСК
// =====================================================

loadPlaces();

console.log(
    "✅ Relax Vinnytsia map готова"
);