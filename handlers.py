from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)

from keyboards import main_menu, places_keyboard
from database import (
    get_all_places,
    get_by_column,
    get_place_by_id,
)
from users import save_user, users_count


router = Router()


# =====================================================
# ДОПОМІЖНА ФУНКЦІЯ
# =====================================================

def is_yes(value):
    return str(value).strip().lower() in {
        "так",
        "є",
        "yes",
        "true",
        "1",
    }


# =====================================================
# START
# =====================================================

@router.message(CommandStart())
async def start(message: Message):

    save_user(message.from_user.id)

    await message.answer(
        "👋 Вітаємо у Relax Vinnytsia!\n\n"
        "Знайдіть найкращі місця для відпочинку "
        "у Вінниці та Вінницькій області.\n\n"
        "👇 Оберіть категорію:",
        reply_markup=main_menu,
    )


# =====================================================
# ВСІ МІСЦЯ
# =====================================================

@router.message(F.text == "🏡 Всі місця")
async def all_places(message: Message):

    places = get_all_places()

    if not places:
        await message.answer("🏡 Місць поки немає.")
        return

    await message.answer(
        "🏡 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# БАСЕЙНИ
# =====================================================

@router.message(F.text == "🏊 Басейни")
async def pools(message: Message):

    places = get_by_column("Басейн")

    if not places:
        await message.answer("🏊 Місць з басейном не знайдено.")
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# АЛЬТАНКИ
# =====================================================

@router.message(F.text == "🛖 Альтанки")
async def gazebos(message: Message):

    places = get_by_column("Альтанка")

    if not places:
        await message.answer("🛖 Альтанок не знайдено.")
        return

    await message.answer(
        "🛖 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# РИБАЛКА
# =====================================================

@router.message(F.text == "🎣 Риболовля")
async def fishing(message: Message):

    places = get_by_column("Рибалка")

    if not places:
        await message.answer("🎣 Місць для риболовлі не знайдено.")
        return

    await message.answer(
        "🎣 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# ЧАНИ ТА САУНИ
# =====================================================

@router.message(F.text == "🧖 Чани та сауни")
async def sauna(message: Message):

    places = []

    places.extend(get_by_column("Чан"))
    places.extend(get_by_column("Сауна/Баня"))

    unique = []
    ids = set()

    for place in places:

        place_id = str(place.get("ID", ""))

        if place_id not in ids:

            ids.add(place_id)
            unique.append(place)

    if not unique:
        await message.answer(
            "🧖 Чанів та саун не знайдено."
        )
        return

    await message.answer(
        "🧖 Оберіть місце:",
        reply_markup=places_keyboard(unique),
    )


# =====================================================
# БУДИНКИ
# =====================================================

@router.message(F.text == "🏠 Будинки")
async def houses(message: Message):

    places = get_by_column("Будинок")

    if not places:
        await message.answer("🏠 Будинків не знайдено.")
        return

    await message.answer(
        "🏠 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# ДЛЯ ДВОХ
# =====================================================

@router.message(F.text == "❤️ Для двох")
async def for_two(message: Message):

    places = get_by_column("Для двох")

    if not places:
        await message.answer(
            "❤️ Місць для двох не знайдено."
        )
        return

    await message.answer(
        "❤️ Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# ДЛЯ КОМПАНІЇ
# =====================================================

@router.message(F.text == "🥳 Для компанії")
async def for_company(message: Message):

    places = get_by_column("Для компанії")

    if not places:
        await message.answer(
            "🥳 Місць для компанії не знайдено."
        )
        return

    await message.answer(
        "🥳 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# БАСЕЙН СЕЗОННИЙ
# =====================================================

@router.message(F.text == "☀️ Басейн сезонний")
async def seasonal_pool(message: Message):

    places = get_by_column("Басейн сезонний")

    if not places:
        await message.answer(
            "☀️ Сезонних басейнів не знайдено."
        )
        return

    await message.answer(
        "☀️ Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# БАСЕЙН ЦІЛОРІЧНИЙ
# =====================================================

@router.message(F.text == "🏊 Басейн цілорічний")
async def year_round_pool(message: Message):

    places = get_by_column("Басейн цілорічний")

    if not places:
        await message.answer(
            "🏊 Цілорічних басейнів не знайдено."
        )
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places),
    )


# =====================================================
# КАРТА
# =====================================================

@router.message(F.text == "🗺 Карта")
async def map_places(message: Message):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🗺 Відкрити карту",
                    url=(
                        "https://rbendiuh-cell.github.io/"
                        "Relax_Vinnytsia_Bot/map/"
                    ),
                )
            ]
        ]
    )

    await message.answer(
        "🗺 <b>Relax Vinnytsia</b>\n\n"
        "Інтерактивна карта місць відпочинку "
        "у Вінниці та Вінницькій області.\n\n"
        "👇 Натисніть кнопку:",
        parse_mode="HTML",
        reply_markup=keyboard,
    )


# =====================================================
# ПРО БОТА
# =====================================================

@router.message(F.text == "ℹ️ Про бота")
async def about(message: Message):

    await message.answer(
        "🤖 <b>Relax Vinnytsia</b>\n\n"
        "Каталог місць для відпочинку "
        "у Вінниці та Вінницькій області.\n\n"
        "🏊 Басейни\n"
        "🛖 Альтанки\n"
        "🏠 Будинки\n"
        "🎣 Риболовля\n"
        "🧖 Чани та сауни\n"
        "❤️ Для двох\n"
        "🥳 Для компанії\n\n"
        "🗺 Інтерактивна карта місць.",
        parse_mode="HTML",
    )


# =====================================================
# ВІДКРИТТЯ МІСЦЯ
# =====================================================

@router.callback_query(F.data.startswith("place_"))
async def show_place(callback: CallbackQuery):

    place_id = callback.data.split("_", 1)[1]

    place = get_place_by_id(place_id)

    if not place:

        await callback.answer(
            "❌ Місце не знайдено."
        )
        return

    name = str(
        place.get("Назва", "Без назви")
    ).strip()

    text = f"🏡 <b>{name}</b>\n\n"


    # -------------------------------------------------
    # МІСТО
    # -------------------------------------------------

    city = str(
        place.get("Місто/СМТ", "")
    ).strip()

    if city:
        text += f"📍 {city}\n"


    # -------------------------------------------------
    # АДРЕСА
    # -------------------------------------------------

    address = str(
        place.get("Адреса", "")
    ).strip()

    if address:
        text += f"📌 {address}\n"


    # -------------------------------------------------
    # ЦІНА
    # -------------------------------------------------

    price = str(
        place.get("Ціна", "")
    ).strip()

    if price:
        text += f"\n💰 {price}\n"


    # -------------------------------------------------
    # ОСОБЛИВОСТІ
    # -------------------------------------------------

    features = []

    if is_yes(place.get("Басейн")):
        features.append("🏊 Басейн")

    if is_yes(place.get("Басейн сезонний")):
        features.append("☀️ Басейн сезонний")

    if is_yes(place.get("Басейн цілорічний")):
        features.append("🏊 Басейн цілорічний")

    if is_yes(place.get("Будинок")):
        features.append("🏠 Будинок")

    if is_yes(place.get("Альтанка")):
        features.append("🛖 Альтанка")

    if is_yes(place.get("Чан")):
        features.append("🧖 Чан")

    if is_yes(place.get("Сауна/Баня")):
        features.append("🔥 Сауна")

    if is_yes(place.get("Рибалка")):
        features.append("🎣 Риболовля")

    if is_yes(place.get("Для двох")):
        features.append("❤️ Для двох")

    if is_yes(place.get("Для компанії")):
        features.append("🥳 Для компанії")


    if features:

        text += (
            "\n✨ <b>Є на території:</b>\n"
        )

        text += "\n".join(features)


    # =================================================
    # ТЕЛЕФОН
    # =================================================

    phone = str(
        place.get("Телефон", "")
    ).strip()

    if phone:

        text += (
            f"\n\n📞 <b>Телефон:</b> "
            f"{phone}"
        )


    # =================================================
    # КНОПКИ
    # =================================================

    buttons = []


    # -------------------------------------------------
    # ПОДЗВОНИТИ
    #
    # НЕ використовуємо tel:
    # Telegram його не приймає.
    # -------------------------------------------------

    if phone:

        buttons.append([
            InlineKeyboardButton(
                text="📞 Подзвонити",
                callback_data=f"call_{place_id}",
            )
        ])


    # -------------------------------------------------
    # INSTAGRAM
    # -------------------------------------------------

    instagram = str(
        place.get("Instagram", "")
    ).strip()

    if instagram:

        buttons.append([
            InlineKeyboardButton(
                text="📷 Instagram",
                url=instagram,
            )
        ])


    # -------------------------------------------------
    # GOOGLE MAPS
    # -------------------------------------------------

    google_maps = str(
        place.get("Google Maps", "")
    ).strip()

    if google_maps:

        buttons.append([
            InlineKeyboardButton(
                text="📍 Google Maps",
                url=google_maps,
            )
        ])


    # -------------------------------------------------
    # НАЗАД
    # -------------------------------------------------

    buttons.append([
        InlineKeyboardButton(
            text="⬅️ Назад",
            callback_data="back",
        )
    ])


    keyboard = InlineKeyboardMarkup(
        inline_keyboard=buttons
    )


    await callback.message.answer(
        text,
        parse_mode="HTML",
        reply_markup=keyboard,
    )

    await callback.answer()


# =====================================================
# КНОПКА "ПОДЗВОНИТИ"
# =====================================================

@router.callback_query(F.data.startswith("call_"))
async def call_place(callback: CallbackQuery):

    place_id = callback.data.split("_", 1)[1]

    place = get_place_by_id(place_id)

    if not place:

        await callback.answer(
            "❌ Місце не знайдено."
        )
        return


    phone = str(
        place.get("Телефон", "")
    ).strip()

    name = str(
        place.get("Назва", "Relax Vinnytsia")
    ).strip()


    if not phone:

        await callback.answer(
            "📞 Номер телефону відсутній."
        )
        return


    # -------------------------------------------------
    # НАДСИЛАЄМО НОМЕР ОКРЕМИМ ПОВІДОМЛЕННЯМ
    # -------------------------------------------------

    await callback.message.answer(
        f"📞 <b>{name}</b>\n\n"
        f"Номер телефону:\n"
        f"<code>{phone}</code>\n\n"
        f"Натисніть на номер, щоб скопіювати "
        f"його та здійснити дзвінок.",
        parse_mode="HTML",
    )

    await callback.answer(
        "📞 Номер телефону"
    )


# =====================================================
# НАЗАД
# =====================================================

@router.callback_query(F.data == "back")
async def back(callback: CallbackQuery):

    try:
        await callback.message.delete()
    except Exception:
        pass

    await callback.message.answer(
        "👇 Оберіть категорію:",
        reply_markup=main_menu,
    )

    await callback.answer()


# =====================================================
# СТАТИСТИКА
# =====================================================

ADMIN_ID = 8181700595


@router.message(Command("stats"))
async def stats(message: Message):

    if message.from_user.id != ADMIN_ID:
        return

    await message.answer(
        "📊 <b>Статистика бота</b>\n\n"
        f"👥 Всього користувачів: "
        f"{users_count()}",
        parse_mode="HTML",
    )