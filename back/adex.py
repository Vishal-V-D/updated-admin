import os
import json
import uuid
import re
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import google.generativeai as genai

# -------------------------
# Load ENV
# -------------------------
load_dotenv()
SUPABASE_URL: str = os.environ.get("SUPABASE_URL") or "https://drdxhvqstjlxguyqpetq.supabase.co"
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZHhodnFzdGpseGd1eXFwZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTI0NTksImV4cCI6MjA2OTg2ODQ1OX0.xd8YlNV8qV58-n1BG5jvcMGmtkH5dWUh92xzKR4JAnI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

GOOGLE_API_KEY ="AIzaSyDLTpXa8KpDzKQ0A-cH0_ckyKlpWbAyQd0"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("⚠️ Missing Supabase credentials")

if not GOOGLE_API_KEY:
    raise Exception("⚠️ Missing GOOGLE_API_KEY")

# -------------------------
# Supabase + Gemini Setup
# -------------------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GOOGLE_API_KEY)

# -------------------------
# FastAPI Setup
# -------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # open for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Schema (Parent Keys)
# -------------------------
PARENT_KEYS = [
    "About",
    "Exam Dates",
    "Eligibility Criteria",
    "Exam Pattern & Syllabus",
    "Yearly Cutoff",
    "Application Fee",
    "Resources",
    "Applylink"
]

SCHEMA_EXAMPLE = {
    "About": {
        "Exam Highlights": [
            {"type": "paragraph", "content": "A paragraph about the exam."},
            {"type": "table", "data": [{"Column 1": "Value", "Column 2": "Another Value"}]}
        ]
    },
    "Exam Dates": {
        "Important Dates": [
            {"type": "paragraph", "content": "A paragraph about dates."},
            {"type": "table", "data": [{"Phase": "Phase 1", "Date": "Some Date"}]}
        ]
    },
    "Eligibility Criteria": {
        "Eligibility Details": [
            {"type": "paragraph", "content": "A paragraph about eligibility."}
        ]
    },
    "Exam Pattern & Syllabus": {
        "Pattern": [
            {"type": "list", "items": ["List item 1", "List item 2"]},
            {"type": "table", "data": [{"Subject": "Subject Name", "Questions": "Number"}]}
        ]
    },
    "Yearly Cutoff": {
        "Past Cutoffs": [
            {"type": "list", "items": ["Some cutoff info.", "More info."]},
            {"type": "table", "data": [{"Course": "Course Name", "Expected Closing Rank": "Rank"}]}
        ]
    },
    "Application Fee": {
        "Fee Details": [
            {"type": "paragraph", "content": "A paragraph about the application fee."}
        ]
    },
    "Resources": {
        "Preparation Resources": [
            {"type": "list", "items": ["Resource 1", "Resource 2"]}
        ]
    },
    "Applylink": "https://example.com"
}

# -------------------------
# Prompt Builder
# -------------------------
def get_prompt(exam_name, raw_content):
    prompt = f"""
    You are an expert at extracting and structuring exam information.
    Convert the raw content about "{exam_name}" into **valid JSON**.

    The JSON must contain these parent keys:
    {", ".join(PARENT_KEYS)}.

    If data is missing, generate meaningful educational content.
    Each section should be rich with details, include tables/lists when appropriate.
    Match the schema below for formatting:

    {json.dumps(SCHEMA_EXAMPLE, indent=2)}

    Raw Content:
    ---
    {raw_content}
    ---

    Output only valid JSON. No markdown, no explanations.
    """
    return prompt

# -------------------------
# Generate Operation
# -------------------------
@app.post("/generate-json")
async def generate_json(request: Request):
    try:
        body = await request.json()
        exam_name = body.get("exam_name")
        raw_content = body.get("raw_content")

        if not exam_name or not raw_content:
            raise HTTPException(status_code=400, detail="exam_name and raw_content are required")

        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = get_prompt(exam_name, raw_content)

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )

        response_text = response.text.strip()

        # Try parsing JSON safely
        try:
            json_output = json.loads(response_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if not match:
                raise ValueError("No valid JSON found")
            json_output = json.loads(match.group(0))

        return json_output

    except Exception as e:
        logger.error(f"❌ generate_json error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# Add Operation
# -------------------------
@app.post("/exams")
async def add_exam(request: Request):
    logger.info("➡️ POST /exams")
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data", {})
        full_details = payload.get("full_details", {})

        if not basic_data.get("Name"):
            raise HTTPException(status_code=400, detail="Name is required in basic_data")

        # Generate UUID
        item_uuid = payload.get("uuid") or str(uuid.uuid4())

        # Insert basic details
        supabase.table("exams_name").insert({
            "id": item_uuid,
            "data": basic_data
        }).execute()

        # Insert full details (include 'name')
        supabase.table("exams").insert({
            "uuid": item_uuid,
            "name": basic_data["Name"],   # ✅ Fix: add required field
            "details": full_details
        }).execute()

        logger.info("✅ Exam added successfully")
        return {"message": "Exam added successfully", "uuid": item_uuid}

    except Exception as e:
        logger.error(f"❌ add_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    logger.info("➡️ POST /exams")
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data", {})
        full_details = payload.get("full_details", {})

        if not basic_data.get("Name"):
            raise HTTPException(status_code=400, detail="Name is required in basic_data")

        # Generate UUID
        item_uuid = payload.get("uuid") or str(uuid.uuid4())

        # Insert basic details
        supabase.table("exams_name").insert({
            "id": item_uuid,
            "data": basic_data
        }).execute()

        # Insert full details
        supabase.table("exams").insert({
            "uuid": item_uuid,
            "details": full_details
        }).execute()

        logger.info("✅ Exam added successfully")
        return {"message": "Exam added successfully", "uuid": item_uuid}

    except Exception as e:
        logger.error(f"❌ add_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/college-exams")
async def add_college_exam(request: Request):
    logger.info("➡️ POST /college-exams")
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data", {})
        full_details = payload.get("full_details", {})

        if not basic_data.get("Name"):
            raise HTTPException(status_code=400, detail="Name is required in basic_data")

        # Generate UUID
        item_uuid = payload.get("uuid") or str(uuid.uuid4())

        # Insert into college tables
        supabase.table("college_specific_exams").insert({
            "id": item_uuid,
            "data": basic_data
        }).execute()

        supabase.table("collegespecificexams").insert({
            "uui": item_uuid,
            "details": full_details
        }).execute()

        logger.info("✅ College exam added successfully")
        return {"message": "College exam added successfully", "uuid": item_uuid}

    except Exception as e:
        logger.error(f"❌ add_college_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
