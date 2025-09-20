import os
import logging
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL: str = os.environ.get("SUPABASE_URL") or "https://drdxhvqstjlxguyqpetq.supabase.co"
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZHhodnFzdGpseGd1eXFwZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTI0NTksImV4cCI6MjA2OTg2ODQ1OX0.xd8YlNV8qV58-n1BG5jvcMGmtkH5dWUh92xzKR4JAnI"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in the .env file")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- FastAPI Setup ----------
app = FastAPI(
    title="College & Exam API",
    description="Combined API for College and Exam data",
    version="1.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("combined-api")
logger.info("🚀 Combined Backend starting...")

# ---------- General Exam Endpoints (CRUD) ----------


@app.post("/exams/create")
async def create_exam(request: Request):
    # This endpoint remains unchanged as it creates the records
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data")
        full_details = payload.get("full_details")
        
        new_uuid = str(uuid.uuid4())
        
        supabase.table("exams_name").insert({"data": basic_data, "uuid": new_uuid}).execute()
        supabase.table("exams").insert({"name": basic_data.get("Name"), "details": full_details, "uuid": new_uuid}).execute()
        
        return {"message": "Exam created successfully", "uuid": new_uuid}
    except Exception as e:
        logger.error(f"Error creating exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))




# ---------- College Specific Exam Endpoints (CRUD) ----------

@app.get("/exams/{item_uuid}")
async def get_exam(item_uuid: str):
    logger.info(f"➡️ GET /exams/{item_uuid}")
    try:
        # --- First try exams_name + exams ---
        logger.info(f"🔍 Searching exams_name.id={item_uuid}")
        basic_res = supabase.table("exams_name").select("id, data").eq("id", item_uuid).execute()
        full_res = supabase.table("exams").select("details").eq("uuid", item_uuid).execute()

        if basic_res.data:
            logger.info("✅ Found in exams_name")
            basic_data = basic_res.data[0]
            full_details = full_res.data[0]['details'] if full_res.data else {}
            return {
                "id": basic_data["id"],
                "uuid": item_uuid,
                "data": {**basic_data["data"], **full_details}
            }

        # --- If not found, fallback to college tables ---
        logger.warning("⚠️ Not found in exams, trying college tables...")
        basic_res = supabase.table("college_specific_exams").select("id, data").eq("id", item_uuid).execute()
        full_res = supabase.table("collegespecificexams").select("details").eq("uuid", item_uuid).execute()

        if basic_res.data:
            logger.info("✅ Found in college_specific_exams")
            basic_data = basic_res.data[0]
            full_details = full_res.data[0]['details'] if full_res.data else {}
            return {
                "id": basic_data["id"],
                "uuid": item_uuid,
                "data": {**basic_data["data"], **full_details}
            }

        logger.error("❌ UUID not found in any table")
        raise HTTPException(status_code=404, detail="UUID not found")

    except Exception as e:
        logger.error(f"❌ get_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/college-exams/{item_uuid}")
async def get_college_exam(item_uuid: str):
    logger.info(f"➡️ GET /college-exams/{item_uuid}")
    try:
        # --- First try college_specific_exams + collegespecificexams ---
        logger.info(f"🔍 Searching college_specific_exams.id={item_uuid}")
        basic_res = supabase.table("college_specific_exams").select("id, data").eq("id", item_uuid).execute()
        full_res = supabase.table("collegespecificexams").select("details").eq("uuid", item_uuid).execute()

        if basic_res.data:
            logger.info("✅ Found in college_specific_exams")
            basic_data = basic_res.data[0]
            full_details = full_res.data[0]['details'] if full_res.data else {}
            return {
                "id": basic_data["id"],
                "uuid": item_uuid,
                "data": {**basic_data["data"], **full_details}
            }

        # --- If not found, fallback to exams tables ---
        logger.warning("⚠️ Not found in college tables, trying exams tables...")
        basic_res = supabase.table("exams_name").select("id, data").eq("id", item_uuid).execute()
        full_res = supabase.table("exams").select("details").eq("uuid", item_uuid).execute()

        if basic_res.data:
            logger.info("✅ Found in exams_name")
            basic_data = basic_res.data[0]
            full_details = full_res.data[0]['details'] if full_res.data else {}
            return {
                "id": basic_data["id"],
                "uuid": item_uuid,
                "data": {**basic_data["data"], **full_details}
            }

        logger.error("❌ UUID not found in any table")
        raise HTTPException(status_code=404, detail="UUID not found")

    except Exception as e:
        logger.error(f"❌ get_college_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/college-exams/create")
async def create_college_exam(request: Request):
    # This endpoint remains unchanged
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data")
        full_details = payload.get("full_details")
        
        new_uuid = str(uuid.uuid4())
        
        supabase.table("college_specific_exams").insert({"data": basic_data, "uuid": new_uuid}).execute()
        supabase.table("collegespecificexams").insert({"name": basic_data.get("InstituteName"), "details": full_details, "uuid": new_uuid}).execute()
        
        return {"message": "College exam created successfully", "uuid": new_uuid}
    except Exception as e:
        logger.error(f"Error creating college exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/exams/{item_uuid}")
async def update_exam(item_uuid: str, request: Request):
    logger.info(f"➡️ PUT /exams/{item_uuid}")
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data", {})
        full_details = payload.get("full_details", {})

        # --- First try exams tables ---
        logger.info(f"🔄 Updating exams_name.id={item_uuid} and exams.uuid={item_uuid}")
        basic_res = supabase.table("exams_name").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("exams_name").update({"data": basic_data}).eq("id", item_uuid).execute()
            supabase.table("exams").update({"details": full_details}).eq("uuid", item_uuid).execute()
            logger.info("✅ Updated in exams tables")
            return {"message": "Exam updated successfully", "uuid": item_uuid}

        # --- If not found, fallback to college tables ---
        logger.warning("⚠️ Not found in exams tables, trying college tables...")
        basic_res = supabase.table("college_specific_exams").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("college_specific_exams").update({"data": basic_data}).eq("id", item_uuid).execute()
            supabase.table("collegespecificexams").update({"details": full_details}).eq("uuid", item_uuid).execute()
            logger.info("✅ Updated in college tables")
            return {"message": "College exam updated successfully", "uuid": item_uuid}

        logger.error("❌ UUID not found in any table")
        raise HTTPException(status_code=404, detail="UUID not found in any table")

    except Exception as e:
        logger.error(f"❌ update_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/college-exams/{item_uuid}")
async def update_college_exam(item_uuid: str, request: Request):
    logger.info(f"➡️ PUT /college-exams/{item_uuid}")
    try:
        payload = await request.json()
        basic_data = payload.get("basic_data", {})
        full_details = payload.get("full_details", {})

        # --- First try college tables ---
        logger.info(f"🔄 Updating college_specific_exams.id={item_uuid} and collegespecificexams.uui={item_uuid}")
        basic_res = supabase.table("college_specific_exams").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("college_specific_exams").update({"data": basic_data}).eq("id", item_uuid).execute()
            supabase.table("collegespecificexams").update({"details": full_details}).eq("uuid", item_uuid).execute()
            logger.info("✅ Updated in college tables")
            return {"message": "College exam updated successfully", "uuid": item_uuid}

        # --- If not found, fallback to exams tables ---
        logger.warning("⚠️ Not found in college tables, trying exams tables...")
        basic_res = supabase.table("exams_name").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("exams_name").update({"data": basic_data}).eq("id", item_uuid).execute()
            supabase.table("exams").update({"details": full_details}).eq("uuid", item_uuid).execute()
            logger.info("✅ Updated in exams tables")
            return {"message": "Exam updated successfully", "uuid": item_uuid}

        logger.error("❌ UUID not found in any table")
        raise HTTPException(status_code=404, detail="UUID not found in any table")

    except Exception as e:
        logger.error(f"❌ update_college_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/exams/{item_uuid}")
async def delete_exam(item_uuid: str):
    logger.info(f"➡️ DELETE /exams/{item_uuid}")
    try:
        # --- First try exams tables ---
        logger.info(f"🗑️ Trying to delete from exams_name.id={item_uuid} and exams.uuid={item_uuid}")
        basic_res = supabase.table("exams_name").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("exams_name").delete().eq("id", item_uuid).execute()
            supabase.table("exams").delete().eq("uuid", item_uuid).execute()
            logger.info("✅ Deleted from exams tables")
            return {"message": "Exam deleted successfully", "uuid": item_uuid}

        # --- If not found, fallback to college tables ---
        logger.warning("⚠️ Not found in exams tables, trying college tables...")
        basic_res = supabase.table("college_specific_exams").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("college_specific_exams").delete().eq("id", item_uuid).execute()
            supabase.table("collegespecificexams").delete().eq("uui", item_uuid).execute()
            logger.info("✅ Deleted from college tables")
            return {"message": "College exam deleted successfully", "uuid": item_uuid}

        logger.error("❌ UUID not found in any table for deletion")
        raise HTTPException(status_code=404, detail="UUID not found in any table")

    except Exception as e:
        logger.error(f"❌ delete_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/college-exams/{item_uuid}")
async def delete_college_exam(item_uuid: str):
    logger.info(f"➡️ DELETE /college-exams/{item_uuid}")
    try:
        # --- First try college tables ---
        logger.info(f"🗑️ Trying to delete from college_specific_exams.id={item_uuid} and collegespecificexams.uui={item_uuid}")
        basic_res = supabase.table("college_specific_exams").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("college_specific_exams").delete().eq("id", item_uuid).execute()
            supabase.table("collegespecificexams").delete().eq("uui", item_uuid).execute()
            logger.info("✅ Deleted from college tables")
            return {"message": "College exam deleted successfully", "uuid": item_uuid}

        # --- If not found, fallback to exams tables ---
        logger.warning("⚠️ Not found in college tables, trying exams tables...")
        basic_res = supabase.table("exams_name").select("id").eq("id", item_uuid).execute()

        if basic_res.data:
            supabase.table("exams_name").delete().eq("id", item_uuid).execute()
            supabase.table("exams").delete().eq("uuid", item_uuid).execute()
            logger.info("✅ Deleted from exams tables")
            return {"message": "Exam deleted successfully", "uuid": item_uuid}

        logger.error("❌ UUID not found in any table for deletion")
        raise HTTPException(status_code=404, detail="UUID not found in any table")

    except Exception as e:
        logger.error(f"❌ delete_college_exam error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Additional Endpoints ----------
@app.get("/exams")
async def get_exams():
    """Fetch all rows from exams_name table"""
    try:
        response = supabase.table("exams_name").select("*").execute()
        return {"count": len(response.data), "data": response.data}
    except Exception as e:
        logger.error(f"⚠ Error fetching exams: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/college-exams")
async def get_college_exams():
    """Fetch all rows from college_specific_exams table"""
    try:
        response = supabase.table("college_specific_exams").select("*").execute()
        return {"count": len(response.data), "data": response.data}
    except Exception as e:
        logger.error(f"⚠ Error fetching college exams: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/iit")
def get_iits():
    res = supabase.table("IITs").select("*").execute()
    return res.data

@app.get("/iiit")
def get_iiits():
    res = supabase.table("IIITs").select("*").execute()
    return res.data

@app.get("/nit")
def get_nits():
    res = supabase.table("NITs").select("*").execute()
    return res.data

@app.get("/gft")
def get_gfts():
    res = supabase.table("GFTS").select("*").execute()
    return res.data

@app.get("/all")
def get_all():
    all_data = {}
    for table in ["IITs", "IIITs", "NITs", "GFTS"]:
        res = supabase.table(table).select("*").execute()
        all_data[table] = res.data
    return all_data