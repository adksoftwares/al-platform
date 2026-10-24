@echo off
setlocal enabledelayedexpansion

REM Set paths and environment variables
set BASE_DIR=d:\AL\subject materials
set SCRIPT_DIR=d:\AL\AlApp\scripts
set PYTHON_CMD=python
set DB_URL=https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app
set PYTHONIOENCODING=utf-8

cd /d "%SCRIPT_DIR%"

echo Starting Daily Quiz Generation at %date% %time% >> quiz_cron.log

REM =====================================================================
REM STEP 1: Generate Daily Quizzes (from random PDF per subject per day)
REM =====================================================================
for %%L in (tamil sinhala english) do (
    for %%S in (biology chemistry physics) do (
        echo Generating Daily Quiz for %%L - %%S >> quiz_cron.log
        %PYTHON_CMD% "%SCRIPT_DIR%\generate_and_upload_quizzes.py" --base "%BASE_DIR%" --lang "%%L" --sub "%%~S" --db "%DB_URL%" >> quiz_cron.log 2>&1
        echo Waiting 20 seconds to prevent Gemini API rate limits... >> quiz_cron.log
        ping 127.0.0.1 -n 21 > nul
    )
)

echo Finished Daily Quiz Generation at %date% %time% >> quiz_cron.log

REM =====================================================================
REM STEP 2: Generate Unit Quizzes (Tamil only - from NIE PDFs per unit)
REM =====================================================================
echo Starting Unit Quiz Generation at %date% %time% >> quiz_cron.log
%PYTHON_CMD% "%SCRIPT_DIR%\generate_unit_quizzes.py" >> quiz_cron.log 2>&1
echo Finished Unit Quiz Generation at %date% %time% >> quiz_cron.log
