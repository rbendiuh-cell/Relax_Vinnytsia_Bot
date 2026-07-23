import asyncio

from aiogram import Bot, Dispatcher

from config import TOKEN
from handlers import router


async def main():
    bot = Bot(TOKEN)
    dp = Dispatcher()

    dp.include_router(router)

    print("✅ Relax Vinnytsia Bot запущений")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())