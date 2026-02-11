---
description: How to add a new Community Story to the application
---

To add a new story to the Community Stories feature, follow these steps:

### 1. Open the Story Script
Open the file [add_community_story.py](file:///e:/Python%20D9/Mindrise/backend/add_community_story.py) in your editor.

### 2. Update the Story Data
Locate the `NEW_STORY` dictionary at the bottom of the file and replace the placeholder text with your story details:

```python
NEW_STORY = {
    "title": "My Inspiring Story",
    "description": "A brief look at how mindfulness changed everything.",
    "content": "Full story text goes here...",
    "image_url": "https://example.com/image.jpg", # Optional: Link to an image
    "author": "Your Name" # Optional
}
```

### 3. Run the Script
Open your terminal and run the following command:

```bash
cd backend
python add_community_story.py
```

### 4. Verify
1. Refresh the MindRise app.
2. Go to the **Explore** page or look at the **Stories** tab on the Home Feed.
3. Your new story should appear in the list!
