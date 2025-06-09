from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def get_video_id(url):
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    elif query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            return parse_qs(query.query)['v'][0]
        elif query.path.startswith('/embed/'):
            return query.path.split('/')[2]
    raise ValueError("Invalid YouTube URL")

# Example video URL
url = "https://www.youtube.com/watch?v=3HjPHSWWSB8"
video_id = get_video_id(url)

# Get transcript
transcript = YouTubeTranscriptApi.get_transcript(video_id)

# Print plain text
full_text = " ".join([entry['text'] for entry in transcript])
print(full_text)
