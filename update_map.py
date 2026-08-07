import pandas as pd
import os

# Шлях до основного файлу
SOURCE_FILE = "data/places.csv"

# Папка для готових CSV
OUTPUT_FOLDER = "map_layers"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Завантажуємо базу
df = pd.read_csv(SOURCE_FILE).fillna("")

# Категорії
categories = {
    "🏊_Басейни": "Басейн",
    "☀️_Басейн_сезонний": "Басейн сезонний",
    "🏊_Басейн_цілорічний": "Басейн цілорічний",
    "🛖_Альтанки": "Альтанка",
    "🎣_Риболовля": "Рибалка",
    "🧖_Чани": "Чан",
    "🏠_Будинки": "Будинок",
    "❤️_Для_двох": "Для двох",
    "🥳_Для_компанії": "Для компанії",
}

for filename, column in categories.items():

    if column not in df.columns:
        continue

    filtered = df[
        df[column]
        .astype(str)
        .str.strip()
        .str.lower()
        == "так"
    ]

    filtered = filtered[
        [
            "Назва",
            "Область",
            "Місто/СМТ",
            "Адреса",
            "Телефон",
            "Ціна",
            "Instagram",
            "Google Maps",
        ]
    ]

    filtered.to_csv(
        os.path.join(OUTPUT_FOLDER, f"{filename}.csv"),
        index=False,
        encoding="utf-8-sig"
    )

print("\n✅ Готово!")
print(f"Створено {len(categories)} файлів.")
print(f"Папка: {OUTPUT_FOLDER}")