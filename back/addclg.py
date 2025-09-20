import os
import json
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from supabase import create_client, Client
from flask_cors import CORS
import uuid

app = Flask(__name__)

# ---------- Supabase Setup ----------
SUPABASE_URL: str = os.environ.get("SUPABASE_URL") or "https://drdxhvqstjlxguyqpetq.supabase.co"
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZHhodnFzdGpseGd1eXFwZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTI0NTksImV4cCI6MjA2OTg2ODQ1OX0.xd8YlNV8qV58-n1BG5jvcMGmtkH5dWUh92xzKR4JAnI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- CORS ----------
from flask_cors import CORS

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]}},
    supports_credentials=True
)


# ---------- Allowed Fields (for new college requests) ----------
ALLOWED_FIELDS = [
    "Name", "Tier", "Type", "Website", "NIRF 2024", "B.Tech Seats", "B.Tech Programmes", "Establishment"
]
# ---------- Map type to table name ----------
TYPE_TO_TABLE = {
    'IIT': 'IITs',
    'IIIT': 'IIITs',
    'NIT': 'NITs',
    'GFTI': 'GFTS'
}

# ---------- College Endpoints ----------
@app.route("/api/iit", methods=["GET"])
def get_iits():
    try:
        res = supabase.table("IITs").select("*").execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch IITs", "details": str(e)}), 500

@app.route("/api/iiit", methods=["GET"])
def get_iiits():
    try:
        res = supabase.table("IIITs").select("*").execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch IIITs", "details": str(e)}), 500

@app.route("/api/nit", methods=["GET"])
def get_nits():
    try:
        res = supabase.table("NITs").select("*").execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch NITs", "details": str(e)}), 500

@app.route("/api/gfti", methods=["GET"])
def get_gfts():
    try:
        res = supabase.table("GFTS").select("*").execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch GFTs", "details": str(e)}), 500

@app.route("/api/all", methods=["GET"])
def get_all():
    all_data = {}
    try:
        for table in ["IITs", "IIITs", "NITs", "GFTS"]:
            res = supabase.table(table).select("*").execute()
            all_data[table] = res.data
        return jsonify(all_data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch all colleges", "details": str(e)}), 500

# Endpoint to fetch a single college for editing
@app.route("/api/college/<id>/<type>", methods=["GET"])
def get_college_by_id_and_type(id, type):
    try:
        table_name = TYPE_TO_TABLE.get(type.upper())
        if not table_name:
            print(f"Invalid college type received: {type}")
            return jsonify({"error": "Invalid college type"}), 400
        
        print(f"Fetching data for ID: {id} and Type: {type.upper()}")
        
        # This will now fetch full data from the main 'colleges' table
        colleges_res = supabase.table("colleges").select("data").eq("uuid", id).single().execute()
        if not colleges_res.data:
            print(f"College with UUID: {id} not found in 'colleges' table.")
            return jsonify({"error": "College not found"}), 404
            
        full_data = colleges_res.data.get("data")
        
        # This will fetch basic data from the specific type table
        basic_res = supabase.table(table_name).select("data").eq("id", id).single().execute()
        if not basic_res.data:
            print(f"College with UUID: {id} not found in '{table_name}' table.")
            return jsonify({"error": "College not found"}), 404

        basic_data = basic_res.data.get("data")
        
        response_data = {
            "full_data": full_data,
            "basic_data": basic_data
        }
        
        print("Data fetched successfully. Sending response:")
        print(json.dumps(response_data, indent=2))
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error fetching college data: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Endpoint to update college details
@app.route("/api/college/<id>/<type>", methods=["PUT"])
def update_college(id, type):
    try:
        data = request.json
        print(f"Received update request for ID: {id} and Type: {type}")
        print("Received data:")
        print(json.dumps(data, indent=2))

        table_name = TYPE_TO_TABLE.get(type.upper())
        
        if not table_name:
            print(f"Invalid college type in request URL: {type}")
            return jsonify({"error": "Invalid college type"}), 400

        # Update the specific type table
        type_table_update_data = {"data": data.get("basic_data")}
        res_type_table = supabase.table(table_name).update(type_table_update_data).eq("id", id).execute()
        
        # Update the main 'colleges' table
        full_data = data.get("full_data")
        
        if full_data:
            # 🔥 Fix: Get 'college_name' from the top-level payload, not from 'full_data'
            colleges_table_update_data = {
                "college_name": data.get("college_name"),
                "data": full_data
            }
            res_colleges = supabase.table("colleges").update(colleges_table_update_data).eq("uuid", id).execute()
        
        if res_type_table.data and res_colleges.data:
            print("College updated successfully in both tables.")
            return jsonify({"message": "College updated successfully"}), 200
        else:
            print(f"Failed to update college. Supabase responses: Type Table: {res_type_table}, Colleges Table: {res_colleges}")
            return jsonify({"error": "Failed to update college"}), 500
            
    except Exception as e:
        print(f"Error updating college data: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# NEW: Endpoint to delete college details
@app.route("/api/college/<id>/<type>", methods=["DELETE"])
def delete_college(id, type):
    try:
        table_name = TYPE_TO_TABLE.get(type.upper())
        if not table_name:
            return jsonify({"error": "Invalid college type"}), 400

        # Delete from the main 'colleges' table first
        res_colleges = supabase.table("colleges").delete().eq("uuid", id).execute()
        
        # Delete from the specific type table
        res_type_table = supabase.table(table_name).delete().eq("id", id).execute()
        
        if res_colleges.data and res_type_table.data:
            return jsonify({"message": "College deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete college"}), 500
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


# ---------- Exam Endpoints ----------
# @app.route("/api/exams", methods=["GET"])
# def get_exams():
#     try:
#         res = supabase.table("Exams").select("*").execute()
#         return jsonify(res.data)
#     except Exception as e:
#         return jsonify({"error": "Failed to fetch exams", "details": str(e)}), 500

# @app.route("/api/exams/type/<exam_type>", methods=["GET"])
# def get_exams_by_type(exam_type: str):
#     try:
#         res = supabase.table("Exams").select("*").eq("type", exam_type).execute()
#         return jsonify(res.data)
#     except Exception as e:
#         return jsonify({"error": f"Failed to fetch exams of type '{exam_type}'", "details": str(e)}), 500

# @app.route("/api/college-exams", methods=["GET"])
# def get_college_exams():
#     """Fetches all rows from the college_specific_exams table."""
#     try:
#         response = supabase.table("college_specific_exams").select("*").execute()
#         return jsonify({"count": len(response.data), "data": response.data})
#     except Exception as e:
#         return jsonify({"error": "Failed to fetch college exams", "details": str(e)}), 500

# ---------- New College Endpoint ----------
@app.route("/api/add-college", methods=["POST"])
def add_new_college():
    try:
        data = request.json
        print("Received add request with data:")
        print(json.dumps(data, indent=2))

        college_name = data.get("college_name")
        college_type = data.get("type")
        full_data = data.get("full_data")
        basic_data = data.get("basic_data")

        if not college_name or not college_type or not full_data or not basic_data:
            return jsonify({"error": "Missing required data"}), 400

        table_name = TYPE_TO_TABLE.get(college_type.upper())
        if not table_name:
            print(f"Invalid college type received: {college_type}")
            return jsonify({"error": "Invalid college type"}), 400
        
        new_uuid = str(uuid.uuid4())

        # Insert into the main 'colleges' table
        colleges_insert_data = {
            "uuid": new_uuid,
            "college_name": college_name,
            "data": full_data
        }
        res_colleges = supabase.table("colleges").insert(colleges_insert_data).execute()

        # Insert into the specific type table
        type_table_insert_data = {
            "id": new_uuid,
            "data": basic_data
        }
        res_type_table = supabase.table(table_name).insert(type_table_insert_data).execute()

        if res_colleges.data and res_type_table.data:
            print("College added successfully to both tables.")
            return jsonify({"message": "College added successfully", "uuid": new_uuid}), 201
        else:
            print(f"Failed to add college. Supabase responses: Colleges Table: {res_colleges}, Type Table: {res_type_table}")
            return jsonify({"error": "Failed to add college"}), 500

    except Exception as e:
        print(f"Error adding college data: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# ---------- Announcements Endpoints ----------
@app.route("/api/announcements", methods=["GET", "POST"])
def handle_announcements():
    if request.method == "GET":
        try:
            res = supabase.table("announcements").select("*").execute()
            return jsonify(res.data)
        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
    elif request.method == "POST":
        try:
            data = request.json
            title = data.get("title")
            data_json = data.get("data_json")
            
            if not title or not data_json:
                return jsonify({"error": "Title and data_json are required"}), 400
            
            insert_data = {
                "title": title,
                "data_json": json.dumps(data_json),
                "id": str(uuid.uuid4())
            }
            
            res = supabase.table("announcements").insert(insert_data).execute()
            
            if res.data:
                return jsonify({"message": "Announcement added successfully"}), 201
            else:
                return jsonify({"error": "Failed to add announcement", "details": str(res)}), 500
        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/api/announcements/<string:announcement_id>", methods=["PUT", "DELETE"])
def update_or_delete_announcement(announcement_id):
    if request.method == "PUT":
        try:
            data = request.json
            title = data.get("title")
            data_json = data.get("data_json")
            priority = data.get("priority")
            scheduled_at = data.get('scheduled_at')

            if not title or not data_json:
                return jsonify({"error": "Title and data_json are required"}), 400
            
            update_data = {"title": title, "data_json": json.dumps(data_json)}
            if priority:
                update_data["priority"] = priority
            if scheduled_at:
                update_data["scheduled_at"] = scheduled_at

            res = supabase.table("announcements").update(update_data).eq("id", announcement_id).execute()
            
            if res.data:
                return jsonify({"message": "Announcement updated successfully"}), 200
            else:
                return jsonify({"error": "Failed to update announcement", "details": str(res)}), 500
        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

    elif request.method == "DELETE":
        try:
            res = supabase.table("announcements").delete().eq("id", announcement_id).execute()
            
            if res.data:
                return jsonify({"message": "Announcement deleted successfully"}), 200
            else:
                return jsonify({"error": "Failed to delete announcement", "details": str(res)}), 500
        except Exception as e:
            return jsonify({"error": "Internal server error", "details": str(e)}), 500

# ---------- Image Upload Endpoint ----------
@app.route("/api/upload-image", methods=["POST"])
def upload_image():
    try:
        data = request.json
        if not data or 'image_data' not in data or 'file_name' not in data:
            return jsonify({"error": "Invalid request body"}), 400

        image_data = data["image_data"]
        file_name = data["file_name"]

        image_bytes = base64.b64decode(image_data)
        
        unique_file_name = f"{uuid.uuid4()}_{file_name}"
        
        res = supabase.storage.from_("images").upload(unique_file_name, image_bytes)
        
        if res:
            return jsonify({"message": "Image uploaded successfully", "file_path": res.path}), 201
        else:
            return jsonify({"error": "Failed to upload image"}), 500
            
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# ---------- College by Type Endpoint ----------
@app.route("/api/college-type/<college_type>", methods=["GET"])
def get_colleges_by_type(college_type: str):
    try:
        res = supabase.table("Colleges").select("*").eq("type", college_type).execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch colleges of type '{college_type}'", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)