from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)

from keyboards import main_menu, places_keyboard
from database import (
    get_all_places,
    get_by_column,
    get_place_by_id
)

router = Router()


# ==========================
# START
# ==========================

@router.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "👋 Вітаємо у Relax Vinnytsia!\n\n"
        "Знайдіть найкращі місця для відпочинку у Вінниці та Вінницькій області.\n\n"
        "👇 Оберіть категорію:",
        reply_markup=main_menu
    )


# ==========================
# Всі місця
# ==========================

@router.message(F.text == "🏡 Всі місця")
async def all_places(message: Message):
    places = get_all_places()

    await message.answer(
        "🏡 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Басейни
# ==========================

@router.message(F.text == "🏊 Басейни")
async def pools(message: Message):

    places = get_by_column("Басейн")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Альтанки
# ==========================

@router.message(F.text == "🛖 Альтанки")
async def gazebos(message: Message):

    places = get_by_column("Альтанка")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🛖 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Риболовля
# ==========================

@router.message(F.text == "🎣 Риболовля")
async def fishing(message: Message):

    places = get_by_column("Рибалка")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🎣 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Чани та сауни
# ==========================

@router.message(F.text == "🧖 Чани та сауни")
async def sauna(message: Message):

    places = get_by_column("Чан")
    places += get_by_column("Сауна/Баня")

    unique = []
    names = set()

    for place in places:
        if place["Назва"] not in names:
            names.add(place["Назва"])
            unique.append(place)

    if not unique:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🧖 Оберіть місце:",
        reply_markup=places_keyboard(unique)
    )


# ==========================
# Будинки
# ==========================

@router.message(F.text == "🏠 Будинки")
async def houses(message: Message):

    places = get_by_column("Будинок")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🏠 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Для двох
# ==========================

@router.message(F.text == "❤️ Для двох")
async def for_two(message: Message):

    places = get_by_column("Для двох")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "❤️ Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Для компанії
# ==========================

@router.message(F.text == "🥳 Для компанії")
async def for_company(message: Message):

    places = get_by_column("Для компанії")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🥳 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Басейн сезонний
# ==========================

@router.message(F.text == "☀️ Басейн сезонний")
async def seasonal_pool(message: Message):

    places = get_by_column("Басейн сезонний")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "☀️ Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Басейн цілорічний
# ==========================

@router.message(F.text == "🏊 Басейн цілорічний")
async def all_year_pool(message: Message):

    places = get_by_column("Басейн цілорічний")

    if not places:
        await message.answer("Нічого не знайдено.")
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# ==========================
# Про бота
# ==========================

@router.message(F.text == "ℹ️ Про бота")
async def about(message: Message):
    await message.answer(
        "🤖 Relax Vinnytsia\n\n"
        "Каталог місць для відпочинку у Вінниці та Вінницькій області."
    )
@router.callback_query(F.data.startswith("place_"))
async def show_place(callback: CallbackQuery):

    place_id = callback.data.split("_")[1]
    place = get_place_by_id(place_id)

    if not place:
        await callback.answer("Місце не знайдено.")
        return

    text = f"🏡 <b>{place['Назва']}</b>\n\n"

    if place.get("Місто/СМТ"):
        text += f"📍 {place['Місто/СМТ']}\n"

    if place.get("Адреса"):
        text += f"📌 {place['Адреса']}\n"

    if place.get("Ціна"):
        text += f"\n💰 {place['Ціна']}\n"

    features = []

    if str(place.get("Басейн", "")).lower() == "так":
        features.append("🏊 Басейн")

    if str(place.get("Басейн сезонний", "")).lower() == "так":
        features.append("☀️ Басейн сезонний")

    if str(place.get("Басейн цілорічний", "")).lower() == "так":
        features.append("🏊 Басейн цілорічний")

    if str(place.get("Будинок", "")).lower() == "так":
        features.append("🏠 Будинок")

    if str(place.get("Альтанка", "")).lower() == "так":
        features.append("🛖 Альтанка")

    if str(place.get("Чан", "")).lower() == "так":
        features.append("🧖 Чан")

    if str(place.get("Сауна/Баня", "")).lower() == "так":
        features.append("🔥 Сауна")

    if str(place.get("Рибалка", "")).lower() == "так":
        features.append("🎣 Риболовля")

    if str(place.get("Для двох", "")).lower() == "так":
        features.append("❤️ Для двох")

    if str(place.get("Для компанії", "")).lower() == "так":
        features.append("🥳 Для компанії")

    if features:
        text += "\n✨ <b>Є на території:</b>\n"
        text += "\n".join(features)

    if place.get("Телефон"):
        text += f"\n\n📞 {place['Телефон']}"

    buttons = []

    row = []

    if place.get("Instagram"):
        row.append(
            InlineKeyboardButton(
                text="📷 Instagram",
                url=place["Instagram"]
            )
        )

    if place.get("Google Maps"):
        row.append(
            InlineKeyboardButton(
                text="📍 Google Maps",
                url=place["Google Maps"]
            )
        )

    if row:
        buttons.append(row)

    buttons.append([
        InlineKeyboardButton(
            text="⬅️ Назад",
            callback_data="back"
        )
    ])

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=buttons
    )

    await callback.message.answer(
        text,
        reply_markup=keyboard
    )

    await callback.answer()
@router.callback_query(F.data == "back")
async def back(callback: CallbackQuery):

    await callback.message.delete()

    await callback.message.answer(
        "👇 Оберіть категорію:",
        reply_markup=main_menu
    )

    await callback.answer()    
