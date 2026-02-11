import sys
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "mindrise")

if not MONGO_URI:
    print("Error: MONGO_URI not found in environment variables.")
    sys.exit(1)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

story_data = {
    "title": "The Greatest Human Brains",
    "description": "The man who created a revolution and made a strong mark",
    "content": """Steve was born on February 24, 1955, in San Francisco, California. He lived in Mountain View, California, this place was later renamed the Silicon Valley. During his childhood, Jobs and his father worked on electronic equipment in the family garage. His father used to demonstrate to him how to take apart and reconstruct electronics. This hobby instilled confidence, tenacity, and mechanical prowess in Jobs. Therefore, the path to excellence started to take off from his family’s garage.

Jobs was always an intelligent and innovative thinker since his childhood. However, his youth was struck in the quicksand of formal schooling education. Due to the boredom, he was a prankster during his days in elementary school, and hence, his fourth-grade teacher needed to bribe him to study. He tested so well that the administrators wanted him to skip ahead to high school. However, his parents declined that offer.

Post high school, Steve enrolled at Reed College in Portland, Oregon. There too, he was frustrated and dropped out of college and spent the next year and a half dropping in on creative classes at the school. He had developed a love of typography during his struggling days.""",
    "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP.jpg/800px-Steve_Jobs_Headshot_2010-CROP.jpg",
    "author": "Admin",
    "created_at": datetime.utcnow().isoformat()
}

try:
    result = db.stories.insert_one(story_data)
    print(f"Successfully inserted story with ID: {result.inserted_id}")
except Exception as e:
    print(f"Error inserting story: {e}")
