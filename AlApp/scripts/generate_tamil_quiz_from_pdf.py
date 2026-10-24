import os
import argparse
import sys
import time

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Please install google-genai: pip install google-genai")
    sys.exit(1)

SYSTEM_PROMPT = """You are a Senior Professor and an elite member of the Sri Lankan Department of Examinations (DoE) National Paper Setting Panel for the Advanced Level (A/L) Examination. Your reputation depends on creating questions that are indistinguishable from official A/L national exam papers.

Your core mission is to analyze an existing Past Paper Question, extract its underlying structural logic and cognitive depth, and map it directly against the official Ministry of Education Resource Book text to create a brand-new, highly standardized Daily Quiz MCQ.

[MANDATORY EVALUATION STEPS & LOGIC]

STEP 1: ANATOMY ANALYSIS OF THE PAST PAPER QUESTION
Deconstruct the provided Past Paper question. Identify:
1. Cognitive Level: Is it testing deep conceptual application, structural evaluation, process sequencing, or direct resource book facts?
2. Linguistic Pattern: How does it phrase questions? (e.g., "තෝරන්න", "ප්රකාශ අතුරින් නිවැරදි වන්නේ", "பின்வருவனவற்றுள் எது?", "Which of the following...").
3. Distractor Strategy: How are the wrong options constructed? Do they use common student misconceptions, inverted facts, or partially correct statements?

STEP 2: RESOURCE BOOK ALIGNMENT & VERBATIM TERMINOLOGY LOCK
Locate the corresponding concepts in the provided Resource Book Source Text. 
- WARNING: You are strictly forbidden from paraphrasing, translating literally via generic AI dictionary terms, or simplifying the language. 
- You MUST extract the exact technical terminology, scientific naming conventions, and grammatical structures utilized in the official Resource Book text for the requested [TARGET LANGUAGE]. If a term sounds unnatural but is the official term in the resource book, you MUST use the resource book term.

STEP 3: COMPOSING THE NEW "A/L STANDARD" QUESTION
Draft a brand-new, unseen MCQ that perfectly mirrors the structural complexity and difficulty matrix of the original past paper question, powered exclusively by the facts inside the Resource Book text.
- Standard Format: 5 distinct options (A, B, C, D, E or 1, 2, 3, 4, 5).
- Plausibility: Every incorrect answer must look 100% correct to a weak student, but be definitively proven wrong by exactly one or two words according to the Resource Book text.

[OUTPUT FORMAT]
Generate ONLY the final structured output. Do not include introductory remarks or conversational meta-text.

### 1. EVALUATION ANALYSIS (Internal Quality Check)
- Conceptual Depth Level: [Identify complexity: Application / Evaluation / Recall]
- Terminology Locked: [List 3-5 core technical terms from the Resource Book used verbatim in this question]

### 2. OFFICIAL EXAMINATION QUESTION
[Output the question here in the requested TARGET LANGUAGE, matching the precise tone of a national exam paper]

A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
E) [Option E]

### 3. EXAMINER'S MARKING SCHEME & JUSTIFICATION
- Correct Answer: [Option]
- Definitive Proof (Resource Book Citation): [Quote the exact line/phrase from the provided Resource Book text that proves this option is correct]
- Distractor Breakdown: Brief explanation of why the other 4 options fail based strictly on the resource book facts.
"""

def wait_for_file_processing(client, file_id):
    """Wait for the uploaded file to become active in Gemini's systems."""
    print(f"Waiting for {file_id} to be processed...")
    while True:
        file_info = client.files.get(name=file_id)
        if file_info.state == 'ACTIVE':
            print(f"File {file_id} is ready.")
            break
        elif file_info.state == 'FAILED':
            raise Exception(f"File processing failed for {file_id}")
        time.sleep(2)

def generate_quiz_from_pdfs(language, subject, past_paper_pdf, resource_pdf, output_file):
    # Validate files exist
    if not os.path.exists(past_paper_pdf):
        print(f"Error: Past paper PDF '{past_paper_pdf}' not found.")
        return
    if not os.path.exists(resource_pdf):
        print(f"Error: Resource book PDF '{resource_pdf}' not found.")
        return

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set. Please set it before running.")
        return
        
    client = genai.Client(api_key=api_key)
    uploaded_files = []
    
    try:
        print(f"Uploading Past Paper PDF: {past_paper_pdf}...")
        pp_file = client.files.upload(file=past_paper_pdf, config={'display_name': 'Past_Paper'})
        uploaded_files.append(pp_file.name)
        wait_for_file_processing(client, pp_file.name)

        print(f"Uploading Resource Book PDF: {resource_pdf}...")
        rb_file = client.files.upload(file=resource_pdf, config={'display_name': 'Resource_Book'})
        uploaded_files.append(rb_file.name)
        wait_for_file_processing(client, rb_file.name)

        input_prompt = f"""[INPUT DATA]
- TARGET LANGUAGE: {language}
- TARGET SUBJECT/STREAM: {subject}
- INSTRUCTIONS FOR PDFS: 
1. The first document is a Past Paper. Please extract ONE representative Multiple Choice Question from it to use as the PAST PAPER REFERENCE QUESTION.
2. The second document is the Official Resource Book. Locate the corresponding section/concept that explains the answer to the chosen question, and use it as the OFFICIAL RESOURCE BOOK SOURCE TEXT.
3. Based on those two, proceed with the system instructions to generate a brand new MCQ.
"""
        print(f"Generating MCQ for {subject} ({language}) using Multimodal PDF Vision...")
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[pp_file, rb_file, input_prompt],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
            ),
        )
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
            
        print(f"Successfully generated quiz and saved to '{output_file}'!")

    except Exception as e:
        print(f"An error occurred: {e}")
        
    finally:
        # Clean up files from Google servers
        print("Cleaning up uploaded PDFs from Gemini API...")
        for file_name in uploaded_files:
            try:
                client.files.delete(name=file_name)
                print(f"Deleted {file_name}")
            except Exception as e:
                print(f"Could not delete {file_name}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate A/L Standard MCQs directly from PDFs using Gemini Multimodal Vision API")
    parser.add_argument("--lang", type=str, required=True, help="Target Language (e.g. Sinhala, English, Tamil)")
    parser.add_argument("--sub", type=str, required=True, help="Target Subject (e.g. Biology, Chemistry)")
    parser.add_argument("--qpdf", type=str, required=True, help="Path to past paper PDF file")
    parser.add_argument("--rpdf", type=str, required=True, help="Path to resource book PDF file")
    parser.add_argument("--out", type=str, default="output_tamil_quiz.md", help="Path to output markdown file")
    
    args = parser.parse_args()
    generate_quiz_from_pdfs(args.lang, args.sub, args.qpdf, args.rpdf, args.out)
