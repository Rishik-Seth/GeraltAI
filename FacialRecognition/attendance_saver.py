from supabase import client, create_client
import json
from datetime import datetime, timezone

supabase = create_client(
    "https://mfdejnigmyjsagcpcevb.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZGVqbmlnbXlqc2FnY3BjZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzk4NTQ0NSwiZXhwIjoyMDI5NTYxNDQ1fQ.rcAqLNaMnki1GJSvj53fZSq4g0qj6F_rXgFdQauT4-s",
)


def UpdateLocationAndGetName(student_id, location):
    data = json.loads(
        supabase.table("student_table")
        .select("current_location, name, location_save_time")
        .eq("id", student_id)
        .execute()
        .json()
    )["data"][0]

    currentLoaction = data["current_location"]
    name = data["name"]
    lastLocationTIme = data["location_save_time"]

    if currentLoaction != location:
        currentTime = datetime.now(timezone.utc).isoformat()
        supabase.table("student_table").update(
            {
                "current_location": location,
                "location_save_time": currentTime,
            }
        ).eq("id", student_id).execute()

        if location == "outside":
            supabase.table("attendances").upsert(
                {
                    "user_id": student_id,
                    "out_time": currentTime,
                }
            ).execute()

        if location == "campus":
            supabase.table("attendances").update(
                {
                    "in_time": currentTime,
                }
            ).eq(
                "user_id", student_id
            ).eq("out_time", lastLocationTIme).execute()

        return True, name
    else:
        return False, name


student_id = "f8f9e4ad-78c4-49dd-82ab-ad1afd0ac53c"

if __name__ == "__main__":
    UpdateLocationAndGetName(student_id, "campus")
    UpdateLocationAndGetName(student_id, "outside")
    print("Done!")
