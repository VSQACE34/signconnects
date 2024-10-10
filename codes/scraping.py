''' important, before running this code, make sure you have installed the following libraries:
!pip install requests beautifulsoup4
'''

import requests
from bs4 import BeautifulSoup
import os

def download_auslan_video(word):
    # Construct the URL
    url = f"https://auslan.org.au/dictionary/gloss/{word}.html"
    
    # Send a GET request to the webpage
    response = requests.get(url)
    
    # Check if the page exists
    if response.status_code != 200:
        print(f"Page not found for {word}")
        return
    
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the video tag, assuming the video is inside a 'video' tag
    video_tag = soup.find('video')
    
    if not video_tag:
        # If there's no video tag, output a "not found" message
        print(f"Video not found on the website for '{word}'")
        return
    
    # Extract the source of the video
    video_source = video_tag.find('source')
    
    if video_source:
        video_url = video_source['src']
        
        # Make a request to download the video
        video_response = requests.get(video_url, stream=True)
        
        # Save the video file with the word as the filename
        video_filename = f"{word}.mp4"
        
        # Write the video content to a file
        with open(video_filename, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    
        print(f"Video for '{word}' downloaded and saved as {video_filename}")
    else:
        print(f"Video source not found for '{word}'")

# List of words to download videos for (example words used)
words = ["clever1a", "happy-1", "depressed1a", "laugh1a"]

# Download videos for each word in the list
for word in words:
    download_auslan_video(word)
