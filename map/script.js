const map = L.map('map').setView([49.2328, 28.48097], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let allPlaces = [];
let markers = [];

const filters = [
    ["pool", "🏊 Басейн"],
    ["gazebo", "🛖 Альтанка"],
    ["fishing", "🎣 Риболовля"],
    ["chan", "🧖 Чан"],
    ["sauna", "🔥 Сауна"],
    ["house", "🏠 Будинок"],
    ["two", "❤️ Для двох"],
    ["company", "🥳 Для компанії"],
    ["season", "☀️ Басейн сезонний"],
    ["year", "🏊 Басейн цілорічний"]
];

const control = L.control({ position: 'topright' });

control.onAdd = function () {
    const div = L.DomUtil.create('div', 'map-filters');

    div.innerHTML = `
        <div class="filter-title">🔎 Фільтри</div>

        <input
            type="text"
            id="search"
            placeholder="Пошук місця..."
        >

        <div class="filter-buttons">
            ${filters.map(([key, name]) => `
                <button class="filter-btn" data-filter="${key}">
                    ${name}
                </button>
            `).join('')}
        </div>

        <button id="resetFilters" class="reset-btn">
            🔄 Скинути фільтри
        </button>
    `;

    L.DomEvent.disableClickPropagation(div);

    return div;
};

control.addTo(map);

let activeFilters = [];

function isYes(value) {
    return String(value || '').trim().toLowerCase() === 'так';
}

function showPlaces() {

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const searchText = document
        .getElementById('search')
        .value
        .toLowerCase()
        .trim();

    const filteredPlaces = allPlaces.filter(place => {

        // Пошук
        const searchMatch =
            !searchText ||
            String(place.name || '').toLowerCase().includes(searchText) ||
            String(place.city || '').toLowerCase().includes(searchText) ||
            String(place.address || '').toLowerCase().includes(searchText);

        if (!searchMatch) {
            return false;
        }

        // Фільтри
        if (activeFilters.length === 0) {
            return true;
        }

        return activeFilters.every(filter => {
            return isYes(place[filter]);
        });
    });

    filteredPlaces.forEach(place => {

        let features = [];

        if (isYes(place.pool)) features.push("🏊 Басейн");
        if (isYes(place.gazebo)) features.push("🛖 Альтанка");
        if (isYes(place.fishing)) features.push("🎣 Риболовля");
        if (isYes(place.chan)) features.push("🧖 Чан");
        if (isYes(place.sauna)) features.push("🔥 Сауна");
        if (isYes(place.house)) features.push("🏠 Будинок");
        if (isYes(place.two)) features.push("❤️ Для двох");
        if (isYes(place.company)) features.push("🥳 Для компанії");
        if (isYes(place.season)) features.push("☀️ Басейн сезонний");
        if (isYes(place.year)) features.push("🏊 Басейн цілорічний");

        const popup = `
            <div class="place-popup">

                <h3>🏡 ${place.name}</h3>

                ${place.city
                    ? `<div>📍 ${place.city}</div>`
                    : ''
                }

                ${place.address
                    ? `<div>📌 ${place.address}</div>`
                    : ''
                }

                ${place.price
                    ? `<div>💰 ${place.price}</div>`
                    : ''
                }

                ${features.length
                    ? `
                        <div class="features">
                            ${features.join('<br>')}
                        </div>
                      `
                    : ''
                }

                ${place.phone
                    ? `<div>📞 ${place.phone}</div>`
                    : ''
                }

                <br>

                ${place.instagram
                    ? `<a href="${place.instagram}" target="_blank">
                        📷 Instagram
                       </a><br>`
                    : ''
                }

                ${place.maps
                    ? `<a href="${place.maps}" target="_blank">
                        📍 Google Maps
                       </a>`
                    : ''
                }

            </div>
        `;

        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(popup);

        markers.push(marker);
    });
}


// Завантаження місць
fetch("places.json")
    .then(response => response.json())
    .then(places => {

        allPlaces = places;

        showPlaces();

        console.log(`Завантажено місць: ${places.length}`);
    })
    .catch(error => {
        console.error("Помилка завантаження places.json:", error);
    });


// Натискання на фільтр
document.addEventListener('click', function(event) {

    const button = event.target.closest('.filter-btn');

    if (!button) {
        return;
    }

    const filter = button.dataset.filter;

    if (activeFilters.includes(filter)) {

        activeFilters = activeFilters.filter(
            item => item !== filter
        );

        button.classList.remove('active');

    } else {

        activeFilters.push(filter);

        button.classList.add('active');
    }

    showPlaces();
});


// Пошук
document.addEventListener('input', function(event) {

    if (event.target.id === 'search') {
        showPlaces();
    }

});


// Скидання фільтрів
document.addEventListener('click', function(event) {

    if (event.target.id !== 'resetFilters') {
        return;
    }

    activeFilters = [];

    document
        .querySelectorAll('.filter-btn')
        .forEach(button => {
            button.classList.remove('active');
        });

    document.getElementById('search').value = '';

    showPlaces();
});