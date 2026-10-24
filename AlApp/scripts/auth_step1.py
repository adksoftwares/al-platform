import asyncio
import os
from telethon import TelegramClient

API_ID = "37049993"
API_HASH = "9ec67daf4d93619636a20307592fb265"
PHONE_NUMBER = "+94777153933"

async def main():
    client = TelegramClient('session_scraper', int(API_ID), API_HASH)
    await client.connect()
    if not await client.is_user_authorized():
        print("Requesting code...")
        result = await client.send_code_request(PHONE_NUMBER)
        with open("phone_code_hash.txt", "w") as f:
            f.write(result.phone_code_hash)
        print("Code requested. phone_code_hash saved.")
    else:
        print("Already authorized!")
    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
