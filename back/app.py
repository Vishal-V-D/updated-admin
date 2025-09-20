import os
import json
import base64
import uuid
from io import BytesIO
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Request, HTTPException, Body, Path, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
import uvicorn

# ---------- Supabase Setup ----------
# Ensure your environment variables are set up
SUPABASE_URL: str = os.environ.get("SUPABASE_URL") or "https://drdxhvqstjlxguyqpetq.supabase.co"
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZHhodnFzdGpseGd1eXFwZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTI0NTksImV4cCI6MjA2OTg2ODQ1OX0.xd8YlNV8qV58-n1BG5jvcMGmtkH5dWUh92xzKR4JAnI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- FastAPI Setup ----------
app = FastAPI(
    title="College API",
    description="A FastAPI backend for managing college data, including CRUD operations for IITs, NITs, IIITs, and GFTS.",
    version="1.0.0"
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Data Models for FastAPI Docs (Pydantic) ----------
# These models define the expected structure for API requests and responses.
# FastAPI uses them to automatically generate the interactive Swagger UI.

ALLOWED_FIELDS = [
   "Name", "Tier", "Type", "Website", "NIRF 2024",
   "B.Tech Seats", "Establishment", "InstituteName",
   "Institute Code", "B.Tech Programmes"
]

TABLE_MAP = {
   "iit": "IITs",
   "iiit": "IIITs", 
   "nit": "NITs",
   "gfti": "GFTS"
}

class CollegeType(BaseModel):
    """Data model for a college entry, including all possible fields."""
    Name: str = Field(..., description="The name of the college.")
    Type: str = Field(..., description="The type of the college (e.g., 'IIT', 'NIT').", pattern="^(iit|iiit|nit|gfti)$")
    Tier: Optional[str] = Field(None, description="The college's tier.")
    Website: Optional[str] = Field(None, description="The college's website URL.")
    NIRF_2024: Optional[int] = Field(None, alias="NIRF 2024", description="The NIRF 2024 ranking.")
    B_Tech_Seats: Optional[int] = Field(None, alias="B.Tech Seats", description="Number of B.Tech seats.")
    Establishment: Optional[int] = Field(None, description="Year of establishment.")
    InstituteCode: Optional[int] = Field(None, alias="Institute Code", description="The institute's unique code.")
    InstituteName: Optional[str] = Field(None, alias="InstituteName", description="The official institute name.")
    B_Tech_Programmes: Optional[List[str]] = Field(None, alias="B.Tech Programmes", description="List of B.Tech programs.")
    
    # Allows additional fields not explicitly defined
    class Config:
        extra = "allow"
        allow_population_by_field_name = True

class CollegeCreateUpdate(BaseModel):
    """Model for creating or updating a college."""
    full_data: CollegeType = Field(..., description="The full data for the college entry.")
    basic_data: Optional[Dict[str, Any]] = Field(None, description="The basic data for the college entry. If not provided, it will be extracted from full_data.")

class Announcement(BaseModel):
    """Model for an announcement entry."""
    title: str = Field(..., description="The title of the announcement.")
    content: Optional[str] = Field(None, description="The content of the announcement.")
    image_base64: Optional[str] = Field(None, description="Base64 encoded image data for the announcement.")
    data_json: Optional[Dict[str, Any]] = Field(None, description="JSON data associated with the announcement.")
    priority: Optional[int] = Field(None, description="Priority of the announcement.")
    scheduled_at: Optional[str] = Field(None, description="Scheduled date for the announcement.")

# ---------- Helper Functions ----------
def get_table_name(institute_type: str) -> str:
    """Helper to get the Supabase table name from the institute type."""
    type_key = institute_type.lower()
    if type_key not in TABLE_MAP:
        raise HTTPException(status_code=400, detail="Invalid institute type")
    return TABLE_MAP[type_key]

# ---------- API Endpoints ----------

@app.post("/api/add-college", summary="Add a new college")
async def add_college(college: CollegeType):
    """
    Creates a new college entry in both the 'colleges' and the specific type table.
    """
    try:
        institute_type = college.Type.strip().lower()
        institute_name = college.Name
        
        if not institute_type or not institute_name:
            raise HTTPException(status_code=400, detail="Type and Name are required")
            
        basic_table_name = get_table_name(institute_type)
        new_uuid = str(uuid.uuid4())
        
        # Filter basic data to only include allowed fields
        basic_data = {k: v for k, v in college.dict(by_alias=True).items() if k in ALLOWED_FIELDS}
        
        # Data for the main 'colleges' table
        college_table_data = {
            "uuid": new_uuid,
            "college_name": institute_name,
            "data": college.dict(by_alias=True) # Full JSON data goes here
        }
        
        # Data for the specific type table (e.g., 'IITs')
        type_table_data = {
            "id": new_uuid, # Use the same UUID
            "data": basic_data # Only basic details
        }
        
        # Insert into both tables
        res_colleges = supabase.table("colleges").insert([college_table_data]).execute()
        if not res_colleges.data:
            raise HTTPException(status_code=500, detail="Failed to add to main colleges table")
            
        res_type_table = supabase.table(basic_table_name).insert([type_table_data]).execute()
        if not res_type_table.data:
            raise HTTPException(status_code=500, detail=f"Failed to insert into {basic_table_name} table")

        return JSONResponse({
            "message": "College data added successfully", 
            "uuid": new_uuid,
            "type": institute_type.upper(),
            "name": institute_name
        }, status_code=201)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/college/{college_uuid}/{institute_type}", summary="Get a single college by UUID and type")
async def get_single_college(
    college_uuid: str = Path(..., description="The UUID of the college."), 
    institute_type: str = Path(..., description="The type of the college (e.g., 'IIT', 'NIT').")
):
    """
    Retrieves a single college's data from both the main 'colleges' table and its specific type table.
    """
    try:
        type_key = institute_type.lower()
        basic_table_name = get_table_name(type_key)

        colleges_res = supabase.table("colleges").select("*").eq("uuid", college_uuid).execute()
        
        if not colleges_res.data:
            raise HTTPException(status_code=404, detail="College not found")
        
        full_data = colleges_res.data[0]["data"]
        college_name = colleges_res.data[0]["college_name"]
        
        basic_res = supabase.table(basic_table_name).select("*").eq("id", college_uuid).execute()
        
        if not basic_res.data:
            raise HTTPException(status_code=404, detail=f"College not found in {basic_table_name} table")
        
        basic_table_data = basic_res.data[0]["data"]
        
        response_data = {
            "uuid": college_uuid,
            "college_name": college_name,
            "institute_type": institute_type.upper(),
            "table_name": TABLE_MAP[type_key],
            "full_data": full_data,
            "basic_data": basic_table_data
        }
        
        return JSONResponse(response_data)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/college/{college_uuid}/{institute_type}", summary="Update an existing college")
async def update_college(
    college_uuid: str = Path(..., description="The UUID of the college."),
    institute_type: str = Path(..., description="The type of the college (e.g., 'IIT', 'NIT')."),
    college_update_data: CollegeCreateUpdate = Body(...)
):
    """
    Updates a college entry in both the 'colleges' and the specific type table.
    """
    try:
        type_key = institute_type.lower()
        basic_table_name = get_table_name(type_key)

        full_data = college_update_data.full_data.dict(by_alias=True)
        basic_data = college_update_data.basic_data
        
        # Update the main 'colleges' table
        college_table_update_data = {
            "college_name": full_data.get("Name"),
            "data": full_data
        }
        
        res_colleges = supabase.table("colleges").update(college_table_update_data).eq("uuid", college_uuid).execute()
        if not res_colleges.data:
            raise HTTPException(status_code=500, detail="Failed to update main colleges table")
        
        # Update the specific type table
        if not basic_data:
            # If basic_data is not provided, generate it from the full_data
            filtered_basic_data = {k: v for k, v in full_data.items() if k in ALLOWED_FIELDS}
        else:
            filtered_basic_data = {k: v for k, v in basic_data.items() if k in ALLOWED_FIELDS}
        
        type_table_update = {"data": filtered_basic_data}
        res_type_table = supabase.table(basic_table_name).update(type_table_update).eq("id", college_uuid).execute()
        if not res_type_table.data:
            raise HTTPException(status_code=500, detail=f"Failed to update {basic_table_name} table")
        
        return JSONResponse({
            "message": "College updated successfully in both tables",
            "uuid": college_uuid,
            "type": institute_type.upper(),
            "tables_updated": ["colleges", basic_table_name]
        })
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/college/{college_uuid}/{institute_type}", summary="Delete a college by UUID and type")
async def delete_college(
    college_uuid: str = Path(..., description="The UUID of the college."), 
    institute_type: str = Path(..., description="The type of the college (e.g., 'IIT', 'NIT').")
):
    """
    Deletes a college entry from both the 'colleges' and the specific type table.
    """
    try:
        type_key = institute_type.lower()
        basic_table_name = get_table_name(type_key)

        colleges_res = supabase.table("colleges").select("college_name").eq("uuid", college_uuid).execute()
        college_name = "Unknown"
        if colleges_res.data:
            college_name = colleges_res.data[0]["college_name"]
        
        res_type_table = supabase.table(basic_table_name).delete().eq("id", college_uuid).execute()
        res_colleges = supabase.table("colleges").delete().eq("uuid", college_uuid).execute()
        
        if not res_colleges.data:
            raise HTTPException(status_code=500, detail="Failed to delete from main colleges table")
            
        return JSONResponse({
            "message": f"College '{college_name}' deleted successfully from both tables",
            "uuid": college_uuid,
            "type": institute_type.upper(),
            "tables_deleted_from": ["colleges", basic_table_name]
        })
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/all", summary="Get all colleges from all tables")
async def get_all_colleges():
    """Retrieves all colleges from all tables (IITs, IIITs, NITs, GFTS)."""
    try:
        all_data = {}
        for table in TABLE_MAP.values():
            res = supabase.table(table).select("*").execute()
            all_data[table] = res.data
        return JSONResponse(all_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/{institute_type}", summary="Get all colleges of a specific type")
async def get_colleges_by_type(
    institute_type: str = Path(..., description="The type of the colleges (e.g., 'iit', 'nit', 'iiit', 'gfti').")
):
    """Retrieves all colleges from a specific table."""
    try:
        basic_table_name = get_table_name(institute_type)
        res = supabase.table(basic_table_name).select("*").execute()
        return JSONResponse(res.data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
# ---------- Announcement Endpoints ----------
@app.post("/api/announcements", summary="Create a new announcement")
async def create_announcement(announcement: Announcement):
    """Creates a new announcement with optional image upload."""
    try:
        image_url = None
        if announcement.image_base64:
            try:
                header, encoded = announcement.image_base64.split(",", 1)
                file_type = header.split(";")[0].split(":")[1]
                image_data = base64.b64decode(encoded)
                file_extension = file_type.split('/')[-1]
                file_name = f"announcement_{os.urandom(4).hex()}.{file_extension}"

                supabase.storage.from_("announce").upload(file_name, BytesIO(image_data).getvalue(), {"content-type": file_type})
                image_url = supabase.storage.from_("announce").get_public_url(file_name)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to process image: {e}")

        announcement_data = announcement.dict(exclude_unset=True)
        announcement_data.pop("image_base64", None) # Remove base64 field before inserting
        if image_url:
            announcement_data["image_url"] = image_url
        if announcement_data.get("data_json"):
            announcement_data["data_json"] = json.dumps(announcement_data["data_json"])

        res = supabase.table("announcements").insert([announcement_data]).execute()

        if res.data:
            return JSONResponse({"message": "Announcement created successfully"}, status_code=201)
        else:
            raise HTTPException(status_code=500, detail="Failed to insert announcement")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.get("/api/announcements", summary="Get all announcements")
async def get_all_announcements():
    """Retrieves a list of all announcements, ordered by creation date."""
    try:
        res = supabase.table("announcements").select("*").order("created_at", desc=True).execute()
        return JSONResponse(res.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.put("/api/announcements/{announcement_id}", summary="Update an announcement")
async def update_announcement(
    announcement_id: str = Path(..., description="The ID of the announcement."),
    announcement: Announcement = Body(...)
):
    """Updates an existing announcement."""
    try:
        update_data = announcement.dict(exclude_unset=True)
        update_data.pop("image_base64", None)
        if update_data.get("data_json"):
            update_data["data_json"] = json.dumps(update_data["data_json"])
        
        res = supabase.table("announcements").update(update_data).eq("id", announcement_id).execute()
        
        if res.data:
            return JSONResponse({"message": "Announcement updated successfully"})
        else:
            raise HTTPException(status_code=500, detail="Failed to update announcement")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.delete("/api/announcements/{announcement_id}", summary="Delete an announcement")
async def delete_announcement(
    announcement_id: str = Path(..., description="The ID of the announcement.")
):
    """Deletes an announcement from the database."""
    try:
        res = supabase.table("announcements").delete().eq("id", announcement_id).execute()
        
        if res.data:
            return JSONResponse({"message": "Announcement deleted successfully"})
        else:
            raise HTTPException(status_code=500, detail="Failed to delete announcement")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# This part is for running the app. You need uvicorn installed.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
