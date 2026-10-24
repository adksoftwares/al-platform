import asyncio
import os
import sys
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

API_ID = "37049993"
API_HASH = "9ec67daf4d93619636a20307592fb265"
PHONE_NUMBER = "+94777153933"

async def main():
    if len(sys.argv) < 3:
        print("Usage: python auth_step2.py <OTP_CODE> <PASSWORD>")
        return
        
    code = sys.argv[1]
    password = sys.argv[2]
    
    with open("phone_code_hash.txt", "r") as f:
        phone_code_hash = f.read().strip()
        
    client = TelegramClient('session_scraper', int(API_ID), API_HASH)
    await client.connect()
    
    if not await client.is_user_authorized():
        print("Signing in with code...")
        try:
            await client.sign_in(phone=PHONE_NUMBER, code=code, phone_code_hash=phone_code_hash)
            print("Successfully signed in! Session saved.")
        except SessionPasswordNeededError:
            print("2FA Password Required! Attempting to sign in with password...")
            try:
                await client.sign_in(password=password)
                print("Successfully signed in with password! Session saved.")
            except Exception as e:
                print(f"Failed to sign in with password: {e}")
        except Exception as e:
            print(f"Failed to sign in: {e}")
    else:
        print("Already authorized!")
        
    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
