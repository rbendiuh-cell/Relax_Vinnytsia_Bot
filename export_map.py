import pandas as pd
import json
import re
import os

SOURCE = "data/places.csv"
OUTPUT = "map/places.json"

df = pd.read_csv(SOURCE).fillna("")

places = []
missing = []

for _, row in df.iterrows():

    url = str(row.get("Google Maps", ""))

    lat = None
    lng = None

    # =====================================================
    # 1. СПОЧАТКУ шукаємо координати самого об'єкта
    #    !3d49.123456!4d28.123456
    # =====================================================

    match = re.search(
        r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)',
        url
    )

    if match:
        lat = float(match.group(1))
        lng = float(match.group(2))

    # =====================================================
    # 2. Якщо !3d !4d немає — шукаємо @координати
    # =====================================================

    if lat is None:

        match = re.search(
            r'@(-?\d+\.\d+),(-?\d+\.\d+)',
            url
        )

        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))

    # =====================================================
    # 3. Якщо немає @ — шукаємо q=координати
    # =====================================================

    if lat is None:

        match = re.search(
            r'q=(-?\d+\.\d+),(-?\d+\.\d+)',
            url
        )

        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))

    # =====================================================
    # Якщо координати не знайдені
    # =====================================================

    if lat is None:

        missing.append(row["Назва"])

        continue

    # =====================================================
    # Додаємо місце
    # =====================================================

    places.append({

        "name": row["Назва"],

        "lat": lat,
        "lng": lng,

        "city": row["Місто/СМТ"],
        "address": row["Адреса"],
        "price": row["Ціна"],
        "phone": row["Телефон"],

        "instagram": row["Instagram"],
        "maps": row["Google Maps"],

        "pool": row.get("Басейн", ""),
        "gazebo": row.get("Альтанка", ""),
        "house": row.get("Будинок", ""),
        "fishing": row.get("Рибалка", ""),
        "chan": row.get("Чан", ""),
        "sauna": row.get("Сауна/Баня", ""),

        "two": row.get("Для двох", ""),
        "company": row.get("Для компанії", ""),

        "season": row.get("Басейн сезонний", ""),
        "year": row.get("Басейн цілорічний", "")
    })


# =========================================================
# Створюємо папку map
# =========================================================

os.makedirs("map", exist_ok=True)


# =========================================================
# Записуємо JSON
# =========================================================

with open(OUTPUT, "w", encoding="utf-8") as f:

    json.dump(
        places,
        f,
        ensure_ascii=False,
        indent=4
    )


# =========================================================
# Результат
# =========================================================

print()
print("======================================")
print(f"✅ На карту додано: {len(places)} місць")
print("======================================")

print()
print(f"❌ Не знайдено координати: {len(missing)}")

if missing:

    print()

    for name in missing:
        print(" -", name)
        
