# YouTube Video Summarizer

A web application that automatically generates concise summaries of YouTube videos using Google's Gemini AI. This tool helps users quickly understand video content without watching the entire video.

## Features

- 🎥 Extract transcripts from YouTube videos
- 🤖 Generate AI-powered summaries using Google's gemini-2.0-flash'

## Important Note About Video Compatibility

The application uses the YouTube Transcript API, which has the following limitations:

- It can only fetch transcripts for videos that have captions enabled
- Videos without captions/subtitles cannot be summarized
- To check if a video has captions, look for the CC (Closed Captions) button in the YouTube video player

## Prompt Given to Google's Gemini LLM to summarize videos

```
You are a note-taking assistant skilled in summarizing educational video content.

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

### Input ###
Transcript:
"""
[Paste the full YouTube transcript here]
"""

Title: [Paste the title of the video here]
Link: [Paste the link to the video here]
Creator/Channel: [Channel or creator name]
Speakers: [List of main speaker(s) and guest(s)]
```

## Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS

### Backend

- Python
- Flask (Web framework)
- Flask-CORS (Cross-origin resource sharing)
- Google Generative AI (Gemini Pro)
- YouTube Transcript API

## Prerequisites

- Python 3.8+
- Node.js 14+
- Google Cloud API key with Gemini API access
- YouTube API access (for transcript extraction)

## Environment Variables

### Backend (.env)

```
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env)

```
REACT_APP_API_URL=your_backend_url
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/youtube-summarizer.git
cd youtube-summarizer
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running Locally

1. Start the backend server:

```bash
python app.py
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Usage

1. Open the web application in your browser
2. Paste a YouTube video URL
3. Click "Summarize"
4. Wait for the AI to generate a summary
5. Read the concise summary of the video content

## Deployment

The application is configured for deployment on:

- Backend: Render.com
- Frontend: Vercel
