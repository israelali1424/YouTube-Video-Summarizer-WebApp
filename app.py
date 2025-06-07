from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and origins

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    pattern = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def get_transcript(video_id):
    """Get transcript for a YouTube video"""
    try:
        # First try to get English transcript without cookies
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(
                video_id,
                languages=['en']
            )
        except Exception as e:
            # If English fails, try any available transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        if not transcript_list:
            raise ValueError("No transcript found for this video")
            
        return ' '.join([item['text'] for item in transcript_list])
    except Exception as e:
        error_msg = str(e)
        if "Could not find a transcript" in error_msg:
            raise ValueError("This video does not have captions enabled. Please check if the CC (Closed Captions) button is available in the YouTube player.")
        elif "no element found" in error_msg:
            raise ValueError("Unable to process the video's captions. This might be due to the captions being in an unsupported format.")
        else:
            raise ValueError(f"Could not fetch transcript: {error_msg}")

def summarize_text(text):
    """Summarize text using Gemini"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f"""You are a note-taking assistant skilled in summarizing educational video content.

Your task is to take a YouTube video transcript and turn it into high-level, structured notes.

Include the following information in this order:

1. **Video Information**
    - Title of the video
    - YouTube link
    - Creator or channel name
    - Names of the main speaker(s) and guest(s)

2. **Summary of the Video**
    - A short but detailed paragraph that explains what the video is mainly about. Focus on the core topic or main argument being presented.

3. **Important Topics Covered**
    - Bullet-point list of key topics or sections discussed in the video. Each bullet should describe one key segment, concept, or idea.

4. **Key Takeaways**
    - Bullet points summarizing the most important insights, lessons, or conclusions from the video.

Your notes should be clear and informative, as if you're preparing study materials or documentation for someone who has not seen the video.
    
    Transcript:
    {text}
    """
    response = model.generate_content(prompt)
    return response.text

@app.route('/', methods=['GET', 'POST', 'OPTIONS'])
def handle_request():
    if request.method == 'OPTIONS':
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    if request.method == 'GET':
        return jsonify({"status": "ok", "message": "YouTube Summarizer API is running"})
    
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({"error": "No URL provided"}), 400
        
        video_id = extract_video_id(data['url'])
        transcript = get_transcript(video_id)
        summary = summarize_text(transcript)
        
        response = jsonify({"summary": summary})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port) 