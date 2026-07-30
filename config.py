import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# TMDb API Configuration
# Get your free API key from https://www.themoviedb.org/settings/api
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "your_tmdb_api_key_here")

# Flask Configuration
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "your_flask_secret_key")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))

# Vidking Player Configuration
VIDKING_BASE_URL = os.getenv("VIDKING_BASE_URL", "https://www.vidking.net")
VIDKING_COLOR = os.getenv("VIDKING_COLOR", "0dcaf0")
VIDKING_AUTOPLAY = os.getenv("VIDKING_AUTOPLAY", "False").lower() == "true"
VIDKING_NEXT_EPISODE = os.getenv("VIDKING_NEXT_EPISODE", "True").lower() == "true"
VIDKING_EPISODE_SELECTOR = os.getenv("VIDKING_EPISODE_SELECTOR", "True").lower() == "true"

# Cache Configuration (for future implementation)
CACHE_TIMEOUT = int(os.getenv("CACHE_TIMEOUT", 3600))  # 1 hour
