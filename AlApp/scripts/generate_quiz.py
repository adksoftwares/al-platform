import os
import argparse
import sys
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

def generate_quiz(language, subject, past_paper_file, resource_text_file, output_file):
    # Validate files exist
    if not os.path.exists(past_paper_file):
        print(f"Error: Past paper file '{past_paper_file}' not found.")
        return
    if not os.path.exists(resource_text_file):
        print(f"Error: Resource text file '{resource_text_file}' not found.")
        return

    with open(past_paper_file, 'r', encoding='utf-8') as f:
        past_paper_q = f.read().strip()
        
    with open(resource_text_file, 'r', encoding='utf-8') as f:
        resource_text = f.read().strip()

    input_prompt = f"""[INPUT DATA]
- TARGET LANGUAGE: {language}
- TARGET SUBJECT/STREAM: {subject}
- PAST PAPER REFERENCE QUESTION: 
\"\"\"
{past_paper_q}
\"\"\"
- OFFICIAL RESOURCE BOOK SOURCE TEXT (Strict Truth):
\"\"\"
{resource_text}
\"\"\"
"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set. Please set it before running.")
        return
        
    client = genai.Client(api_key=api_key)
    
    print(f"Generating MCQ for {subject} ({language})...")
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=input_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.4, # Lower temperature for stricter factual adherence
        ),
    )
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(response.text)
        
    print(f"Successfully generated quiz and saved to '{output_file}'!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate A/L Standard MCQs using Gemini API")
    parser.add_argument("--lang", type=str, required=True, help="Target Language (e.g. Sinhala, English, Tamil)")
    parser.add_argument("--sub", type=str, required=True, help="Target Subject (e.g. Biology, Chemistry)")
    parser.add_argument("--qfile", type=str, default="input_question.txt", help="Path to past paper question text file")
    parser.add_argument("--rfile", type=str, default="input_resource.txt", help="Path to resource book text file")
    parser.add_argument("--out", type=str, default="output_quiz.md", help="Path to output markdown file")
    
    args = parser.parse_args()
    generate_quiz(args.lang, args.sub, args.qfile, args.rfile, args.out)
