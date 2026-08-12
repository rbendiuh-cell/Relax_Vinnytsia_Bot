```python
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
        reply_markup=main_menu
    )


# =====================================================
# ВСІ МІСЦЯ
# =====================================================

@router.message(F.text == "🏡 Всі місця")
async def all_places(message: Message):

    places = get_all_places()

    if not places:
        await message.answer(
            "Наразі місць не знайдено."
        )
        return

    await message.answer(
        "🏡 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# =====================================================
# БАСЕЙНИ
# =====================================================

@router.message(F.text == "🏊 Басейни")
async def pools(message: Message):

    places = get_by_column("Басейн")

    if not places:
        await message.answer(
            "🏊 Місць з басейном не знайдено."
        )
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# =====================================================
# АЛЬТАНКИ
# =====================================================

@router.message(F.text == "🛖 Альтанки")
async def gazebos(message: Message):

    places = get_by_column("Альтанка")

    if not places:
        await message.answer(
            "🛖 Місць з альтанками не знайдено."
        )
        return

    await message.answer(
        "🛖 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# =====================================================
# РИБОЛОВЛЯ
# =====================================================

@router.message(F.text == "🎣 Риболовля")
async def fishing(message: Message):

    places = get_by_column("Рибалка")

    if not places:
        await message.answer(
            "🎣 Місць для риболовлі не знайдено."
        )
        return

    await message.answer(
        "🎣 Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# =====================================================
# ЧАНИ ТА САУНИ
# =====================================================

@router.message(F.text == "🧖 Чани та сауни")
async def sauna(message: Message):

    places = []

    places.extend(
        get_by_column("Чан")
    )

    places.extend(
        get_by_column("Сауна/Баня")
    )

    # Прибираємо дублікати
    unique = []
    names = set()

    for place in places:

        name = place.get(
            "Назва",
            ""
        )

        if name not in names:

            names.add(name)

            unique.append(place)

    if not unique:
        await message.answer(
            "🧖 Місць з чанами або саунами не знайдено."
        )
        return

    await message.answer(
        "🧖 Оберіть місце:",
        reply_markup=places_keyboard(unique)
    )


# =====================================================
# БУДИНКИ
# =====================================================

@router.message(F.text == "🏠 Будинки")
async def houses(message: Message):

    places = get_by_column("Будинок")

    if not places:
        await message.answer(
            "🏠 Будинків не знайдено."
        )
        return

    await message.answer(
        "🏠 Оберіть місце:",
        reply_markup=places_keyboard(places)
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
        reply_markup=places_keyboard(places)
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
        reply_markup=places_keyboard(places)
    )


# =====================================================
# БАСЕЙН СЕЗОННИЙ
# =====================================================

@router.message(F.text == "☀️ Басейн сезонний")
async def seasonal_pool(message: Message):

    places = get_by_column(
        "Басейн сезонний"
    )

    if not places:
        await message.answer(
            "☀️ Сезонних басейнів не знайдено."
        )
        return

    await message.answer(
        "☀️ Оберіть місце:",
        reply_markup=places_keyboard(places)
    )


# =====================================================
# БАСЕЙН ЦІЛОРІЧНИЙ
# =====================================================

@router.message(F.text == "🏊 Басейн цілорічний")
async def all_year_pool(message: Message):

    places = get_by_column(
        "Басейн цілорічний"
    )

    if not places:
        await message.answer(
            "🏊 Цілорічних басейнів не знайдено."
        )
        return

    await message.answer(
        "🏊 Оберіть місце:",
        reply_markup=places_keyboard(places)
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
                    )
                )
            ]
        ]
    )

    await message.answer(
        "🗺 <b>Relax Vinnytsia — карта місць</b>\n\n"
        "На карті можна переглянути місця "
        "відпочинку Вінниці та Вінницької області.\n\n"
        "📍 Усі місця\n"
        "🏊 Басейни\n"
        "🛖 Альтанки\n"
        "🏠 Будинки\n"
        "🎣 Риболовля\n"
        "🧖 Чани та сауни\n\n"
        "👇 Натисніть кнопку нижче:",
        parse_mode="HTML",
        reply_markup=keyboard
    )


# =====================================================
# КАРТА МІСЦЬ
# =====================================================

@router.message(F.text == "🗺 Карта місць")
async def map_places_old(message: Message):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🗺 Відкрити карту",
                    url=(
                        "https://rbendiuh-cell.github.io/"
                        "Relax_Vinnytsia_Bot/map/"
                    )
                )
            ]
        ]
    )

    await message.answer(
        "🗺 <b>Relax Vinnytsia — карта місць</b>\n\n"
        "Відкрийте карту, щоб переглянути "
        "всі місця та скористатися фільтрами.",
        parse_mode="HTML",
        reply_markup=keyboard
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
        "🏡 Місця для відпочинку\n"
        "🏊 Басейни\n"
        "🛖 Альтанки\n"
        "🏠 Будинки\n"
        "🎣 Риболовля\n"
        "🧖 Чани та сауни\n\n"
        "🗺 Також доступна інтерактивна карта "
        "з усіма місцями.",
        parse_mode="HTML"
    )


# =====================================================
# ПОКАЗ МІСЦЯ
# =====================================================

@router.callback_query(
    F.data.startswith("place_")
)
async def show_place(
    callback: CallbackQuery
):

    place_id = callback.data.split(
        "_",
        1
    )[1]

    place = get_place_by_id(
        place_id
    )

    if not place:

        await callback.answer(
            "Місце не знайдено."
        )

        return


    # =================================================
    # НАЗВА
    # =================================================

    name = place.get(
        "Назва",
        "Без назви"
    )


    text = (
        f"🏡 <b>{name}</b>\n\n"
    )


    # =================================================
    # МІСТО
    # =================================================

    if place.get("Місто/СМТ"):

        text += (
            f"📍 {place['Місто/СМТ']}\n"
        )


    # =================================================
    # АДРЕСА
    # =================================================

    if place.get("Адреса"):

        text += (
            f"📌 {place['Адреса']}\n"
        )


    # =================================================
    # ЦІНА
    # =================================================

    if place.get("Ціна"):

        text += (
            f"\n💰 {place['Ціна']}\n"
        )


    # =================================================
    # ОСОБЛИВОСТІ
    # =================================================

    features = []


    if str(
        place.get("Басейн", "")
    ).strip().lower() == "так":

        features.append(
            "🏊 Басейн"
        )


    if str(
        place.get("Басейн сезонний", "")
    ).strip().lower() == "так":

        features.append(
            "☀️ Басейн сезонний"
        )


    if str(
        place.get("Басейн цілорічний", "")
    ).strip().lower() == "так":

        features.append(
            "🏊 Басейн цілорічний"
        )


    if str(
        place.get("Будинок", "")
    ).strip().lower() == "так":

        features.append(
            "🏠 Будинок"
        )


    if str(
        place.get("Альтанка", "")
    ).strip().lower() == "так":

        features.append(
            "🛖 Альтанка"
        )


    if str(
        place.get("Чан", "")
    ).strip().lower() == "так":

        features.append(
            "🧖 Чан"
        )


    if str(
        place.get("Сауна/Баня", "")
    ).strip().lower() == "так":

        features.append(
            "🔥 Сауна"
        )


    if str(
        place.get("Рибалка", "")
    ).strip().lower() == "так":

        features.append(
            "🎣 Риболовля"
        )


    if str(
        place.get("Для двох", "")
    ).strip().lower() == "так":

        features.append(
            "❤️ Для двох"
        )


    if str(
        place.get("Для компанії", "")
    ).strip().lower() == "так":

        features.append(
            "🥳 Для компанії"
        )


    if features:

        text += (
            "\n✨ <b>Є на території:</b>\n"
        )

        text += (
            "\n".join(features)
        )


    # =================================================
    # ТЕЛЕФОН У ТЕКСТІ НЕ ПОКАЗУЄМО
    # =================================================
    #
    # Телефон буде окремою кнопкою
    # "📞 Подзвонити"
    #


    # =================================================
    # КНОПКИ
    # =================================================

    buttons = []


    # -------------------------------------------------
    # ТЕЛЕФОН
    # -------------------------------------------------

    if place.get("Телефон"):

        buttons.append([
            InlineKeyboardButton(
                text="📞 Подзвонити",
                callback_data=(
                    f"call_{place_id}"
                )
            )
        ])


    # -------------------------------------------------
    # INSTAGRAM + GOOGLE MAPS
    # -------------------------------------------------

    row = []


    if place.get("Instagram"):

        row.append(
            InlineKeyboardButton(
                text="📷 Instagram",
                url=str(
                    place["Instagram"]
                ).strip()
            )
        )


    if place.get("Google Maps"):

        row.append(
            InlineKeyboardButton(
                text="📍 Google Maps",
                url=str(
                    place["Google Maps"]
                ).strip()
            )
        )


    if row:

        buttons.append(row)


    # -------------------------------------------------
    # НАЗАД
    # -------------------------------------------------

    buttons.append([
        InlineKeyboardButton(
            text="⬅️ Назад",
            callback_data="back"
        )
    ])


    keyboard = InlineKeyboardMarkup(
        inline_keyboard=buttons
    )


    # =================================================
    # ВІДПРАВЛЯЄМО
    # =================================================

    await callback.message.answer(
        text,
        parse_mode="HTML",
        reply_markup=keyboard
    )


    await callback.answer()


# =====================================================
# КНОПКА "ПОДЗВОНИТИ"
# =====================================================

@router.callback_query(
    F.data.startswith("call_")
)
async def call_place(
    callback: CallbackQuery
):

    place_id = callback.data.split(
        "_",
        1
    )[1]


    place = get_place_by_id(
        place_id
    )


    if not place:

        await callback.answer(
            "Місце не знайдено."
        )

        return


    phone = str(
        place.get(
            "Телефон",
            ""
        )
    ).strip()


    if not phone:

        await callback.answer(
            "📞 Номер телефону відсутній."
        )

        return


    name = str(
        place.get(
            "Назва",
            "Relax Vinnytsia"
        )
    ).strip()


    # =================================================
    # НАДСИЛАЄМО КОНТАКТ TELEGRAM
    # =================================================

    await callback.message.answer_contact(
        phone_number=phone,
        first_name=name
    )


    await callback.answer(
        "📞 Номер телефону"
    )


# =====================================================
# НАЗАД
# =====================================================

@router.callback_query(
    F.data == "back"
)
async def back(
    callback: CallbackQuery
):

    try:

        await callback.message.delete()

    except Exception:

        pass


    await callback.message.answer(
        "👇 Оберіть категорію:",
        reply_markup=main_menu
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
        parse_mode="HTML"
    )
```
