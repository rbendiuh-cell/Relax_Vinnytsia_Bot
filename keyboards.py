from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)

# ==========================
# Головне меню
# ==========================

main_menu = ReplyKeyboardMarkup(
    keyboard=[
        [
            KeyboardButton(text="🏡 Всі місця"),
            KeyboardButton(text="🏊 Басейни")
        ],
        [
            KeyboardButton(text="🛖 Альтанки"),
            KeyboardButton(text="🎣 Риболовля")
        ],
        [
            KeyboardButton(text="🧖 Чани та сауни"),
            KeyboardButton(text="🏠 Будинки")
        ],
        [
            KeyboardButton(text="❤️ Для двох"),
            KeyboardButton(text="🥳 Для компанії")
        ],
        [
            KeyboardButton(text="☀️ Басейн сезонний"),
            KeyboardButton(text="🏊 Басейн цілорічний")
        ],
        [
            KeyboardButton(text="ℹ️ Про бота")
        ]
    ],
    resize_keyboard=True
)


# ==========================
# Кнопки зі списком місць
# ==========================

def places_keyboard(places):

    keyboard = []

    for place in places:
        keyboard.append([
            InlineKeyboardButton(
                text=place["Назва"],
                callback_data=f"place_{place['ID']}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="⬅️ Назад",
            callback_data="back"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)