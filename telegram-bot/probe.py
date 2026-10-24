import os
import asyncio
from telethon.sync import TelegramClient
from dotenv import load_dotenv

load_dotenv()
API_ID = os.getenv('TG_API_ID')
API_HASH = os.getenv('TG_API_HASH')
PHONE = os.getenv('TG_PHONE_NUMBER')
TARGET_BOT = '@SLPHYSICALandBIO_2BOT'

async def main():
    client = TelegramClient('userbot_session', int(API_ID), API_HASH)
    await client.start(phone=PHONE)
    print("Logged in!")
    
    print("Sending /start")
    await client.send_message(TARGET_BOT, '/start')
    await asyncio.sleep(4)
    
    msgs = await client.get_messages(TARGET_BOT, limit=5)
    for i, msg in enumerate(msgs):
        print(f"[{i}] id={msg.id} out={msg.out} text={repr(msg.text)}")
        if msg.reply_markup and hasattr(msg.reply_markup, 'rows'):
            print("  Has reply markup with buttons")
            for r in msg.reply_markup.rows:
                for b in r.buttons:
                    print(f"    - {b.text.encode('ascii','ignore').decode('ascii')}")

asyncio.run(main())

