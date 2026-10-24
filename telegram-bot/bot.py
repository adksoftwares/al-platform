import os
import subprocess
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TARGET_DIR = r"d:\AL\subjects-materials\subjects"

SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Combined-Maths']
CATEGORIES = ['Assignments', 'Past-Papers', 'Elaborations']

user_uploads = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! Send me a file, and I will upload it to the subjects-materials repository.")

async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    document = update.message.document
    file_id = document.file_id
    file_name = document.file_name
    
    user_uploads[update.effective_user.id] = {
        'file_id': file_id,
        'file_name': file_name,
        'subject': None,
        'category': None
    }
    
    keyboard = [[InlineKeyboardButton(sub, callback_data=f"sub_{sub}")] for sub in SUBJECTS]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"Received {file_name}. Please select the subject:",
        reply_markup=reply_markup
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    upload_data = user_uploads.get(user_id)
    
    if not upload_data:
        await query.edit_message_text("Session expired. Please upload the file again.")
        return

    data = query.data
    if data.startswith("sub_"):
        subject = data.replace("sub_", "")
        upload_data['subject'] = subject
        
        keyboard = [[InlineKeyboardButton(cat, callback_data=f"cat_{cat}")] for cat in CATEGORIES]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            f"Subject '{subject}' selected. Now select the category:",
            reply_markup=reply_markup
        )
    
    elif data.startswith("cat_"):
        category = data.replace("cat_", "")
        upload_data['category'] = category
        subject = upload_data['subject']
        file_name = upload_data['file_name']
        file_id = upload_data['file_id']
        
        await query.edit_message_text(f"Saving '{file_name}' to {subject}/{category}...")
        
        try:
            new_file = await context.bot.get_file(file_id)
            save_path = os.path.join(TARGET_DIR, subject, category)
            os.makedirs(save_path, exist_ok=True)
            file_path = os.path.join(save_path, file_name)
            
            await new_file.download_to_drive(file_path)
            
            await query.edit_message_text(f"File saved locally. Committing to GitHub...")
            
            repo_dir = r"d:\AL\subjects-materials"
            subprocess.run(["git", "add", "."], cwd=repo_dir, check=True)
            subprocess.run(["git", "commit", "-m", f"Upload {file_name} via Telegram Bot"], cwd=repo_dir, check=True)
            subprocess.run(["git", "push", "origin", "master"], cwd=repo_dir, check=True)
            
            await query.edit_message_text(f"Successfully uploaded and pushed {file_name} to GitHub!")
        except Exception as e:
            await query.edit_message_text(f"Error during save or git push: {e}")
        finally:
            if user_id in user_uploads:
                del user_uploads[user_id]

def main():
    if not TOKEN or TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("Please set TELEGRAM_BOT_TOKEN in the .env file.")
        return

    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    app.add_handler(CallbackQueryHandler(button_handler))

    print("Bot is polling...")
    app.run_polling()

if __name__ == "__main__":
    main()
