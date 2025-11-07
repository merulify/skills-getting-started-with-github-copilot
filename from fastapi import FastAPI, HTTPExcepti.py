from fastapi import FastAPI, HTTPException
from typing import List

app = FastAPI()

# Define activities
activities = {
    "coding": {
        "participants": [],
        "description": "Coding activities"
    },
    "drawing": {
        "participants": [],
        "description": "Drawing activities"
    },
    "dancing": {
        "participants": [],
        "description": "Dancing activities"
    }
}

@app.get("/activities")
def list_activities():
    """List all activities"""
    return activities

@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]

    # Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student is already signed up")

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}