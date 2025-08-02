# Streamly

A modern, responsive web application that aggregates streaming sources for movies and TV shows using the TMDb API. Built with Flask and vanilla JavaScript, featuring a beautiful glassmorphism UI design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.7+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.0+-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)

## Features

### Core Functionality
- **Universal Search**: Search for movies and TV shows with real-time suggestions
- **Multiple Streaming Sources**: Aggregates from VidSrc.to, VidSrc.me, SuperEmbed, and 2Embed
- **Genre Discovery**: Browse content by trending, action, comedy, drama, horror, and sci-fi
- **TV Show Support**: Full season and episode selection for TV series
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🛡Security & Performance
- **Rate Limiting**: Built-in API rate limiting to prevent abuse
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Content Filtering**: Automatic filtering of adult content
- **Caching Ready**: Configurable caching system for improved performance

### User Experience
- **Glassmorphism UI**: Modern, translucent design with blur effects
- **Auto-suggestions**: Real-time search suggestions as you type
- **Keyboard Shortcuts**: Ctrl/Cmd + K to focus search, Escape to close suggestions
- **Loading States**: Smooth loading animations and progress indicators
- **Mobile Optimized**: Touch-friendly interface with responsive grid layouts

## Quick Start

### Prerequisites
- Python 3.7 or higher
- TMDb API key (free from [TMDb](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/streamly.git
   cd streamly
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask requests python-dotenv
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # TMDb API Key (required)
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   
   # Flask Configuration
   DEBUG=True
   SECRET_KEY=your_secret_key_here
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=5000
   
   # Streaming Sources (enable/disable)
   ENABLE_VIDSRC_TO=True
   ENABLE_VIDSRC_ME=True
   ENABLE_SUPEREMBED=True
   ENABLE_2EMBED=True
   
   # Cache Settings
   CACHE_TIMEOUT=3600
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
streamly/
├── app.py                 # Main Flask application
├── config.py             # Configuration management
├── .env                  # Environment variables (create this)
├── requirements.txt      # Python dependencies (create this)
├── README.md            # This file
├── static/
│   ├── css/
│   │   └── style.css    # Main stylesheet with glassmorphism design
│   ├── js/
│   │   └── script.js    # Frontend JavaScript functionality
│   └── images/
│       └── fav.png      # Favicon (add your own)
└── templates/
    └── index.html       # Main HTML template
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TMDB_API_KEY` | Your TMDb API key | None | ✅ Yes |
| `DEBUG` | Enable Flask debug mode | `True` | No |
| `SECRET_KEY` | Flask secret key for sessions | Generated | No |
| `HOST` | Server host address | `0.0.0.0` | No |
| `PORT` | Server port number | `5000` | No |
| `ENABLE_VIDSRC_TO` | Enable VidSrc.to source | `True` | No |
| `ENABLE_VIDSRC_ME` | Enable VidSrc.me source | `True` | No |
| `ENABLE_SUPEREMBED` | Enable SuperEmbed source | `True` | No |
| `ENABLE_2EMBED` | Enable 2Embed source | `True` | No |
| `CACHE_TIMEOUT` | Cache timeout in seconds | `3600` | No |

### Getting TMDb API Key

1. Visit [TMDb](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Fill out the form with your application details
6. Copy your API key to the `.env` file

## API Endpoints

### Search
- `GET /api/search?q={query}&type={media_type}`
  - Search for movies and TV shows
  - Parameters: `q` (query string), `type` (multi/movie/tv)

### Suggestions
- `GET /api/suggestions/{genre}`
  - Get random suggestions by genre
  - Genres: trending, action, comedy, drama, horror, sci-fi

### Content Details
- `GET /api/movie/{movie_id}` - Get movie details
- `GET /api/tv/{tv_id}` - Get TV show details
- `GET /api/tv/{tv_id}/seasons` - Get TV show seasons
- `GET /api/tv/{tv_id}/season/{season_number}/episodes` - Get season episodes

### Streaming
- `POST /api/stream` - Get streaming sources
  - Body: `{"imdb_id": "tt1234567", "media_type": "movie"}`
  - For TV: Include `"season": 1, "episode": 1`

## Customization

### Styling
The application uses a glassmorphism design with CSS custom properties. Key styling files:
- `static/css/style.css` - Main stylesheet with responsive design
- Glassmorphism effects with `backdrop-filter` and `rgba` backgrounds
- CSS Grid and Flexbox for responsive layouts

### Adding New Streaming Sources
To add a new streaming source:

1. Update the configuration in `config.py`:
   ```python
   ENABLE_NEW_SOURCE = os.getenv('ENABLE_NEW_SOURCE', 'True').lower() == 'true'
   ```

2. Add the source logic in `app.py` within the `get_streaming_sources` method:
   ```python
   if ENABLE_NEW_SOURCE:
       if media_type == "movie":
           new_source_url = f"https://newsource.com/embed/movie/{imdb_id}"
       else:
           new_source_url = f"https://newsource.com/embed/tv/{imdb_id}/{season}/{episode}"
       
       sources.append({
           "name": "New Source",
           "url": new_source_url,
           "quality": "HD",
           "subtitles": True,
           "type": "iframe"
       })
   ```

### Themes
The application supports easy theme customization through CSS variables. Modify the gradient backgrounds and glassmorphism effects in `style.css`.

## Security Features

- **Rate Limiting**: 30-60 requests per minute per IP
- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Proper CORS headers for API endpoints
- **Content Filtering**: Adult content is automatically filtered out
- **Error Handling**: Secure error messages without exposing system details

## Mobile Support

The application is fully responsive with:
- Touch-friendly interface
- Optimized layouts for mobile screens
- Swipe-friendly genre tabs
- Mobile-optimized video player
- Responsive grid systems

## Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

#### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Using Docker
Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### Environment Variables for Production
```env
DEBUG=False
SECRET_KEY=your_production_secret_key
HOST=0.0.0.0
PORT=5000
```

## 🛠️ Development

### Requirements File
Create `requirements.txt`:
```txt
Flask==2.3.3
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
```

### Development Setup
```bash
# Install development dependencies
pip install -r requirements.txt

# Run in development mode
export FLASK_ENV=development
python app.py
```

### Code Structure
- **Backend**: Flask application with modular design
- **Frontend**: Vanilla JavaScript with ES6+ features
- **Styling**: Modern CSS with glassmorphism effects
- **API**: RESTful endpoints with proper error handling

## Troubleshooting

### Common Issues

1. **TMDb API Key Error**
   ```
   ERROR: Please set your TMDb API key in config.py or .env file
   ```
   **Solution**: Add your TMDb API key to the `.env` file

2. **Module Not Found Error**
   ```
   ModuleNotFoundError: No module named 'requests'
   ```
   **Solution**: Install dependencies with `pip install -r requirements.txt`

3. **Port Already in Use**
   ```
   OSError: [Errno 48] Address already in use
   ```
   **Solution**: Change the PORT in `.env` file or kill the process using the port

4. **CORS Issues**
   - Ensure proper headers are set in the Flask application
   - Check browser console for CORS-related errors

5. **Streaming Sources Not Loading**
   - Check if the streaming source websites are accessible
   - Verify IMDb ID format in API requests
   - Check browser console for iframe loading errors

### Debug Mode
Enable debug mode for detailed error messages:
```env
DEBUG=True
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [TMDb](https://www.themoviedb.org/) for providing the movie and TV show database API
- [VidSrc](https://vidsrc.to/) and other streaming source providers
- Flask community for the excellent web framework
- Contributors and users of this project

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/streamly/issues)
3. Create a new issue with detailed information about your problem

## Updates

### Version 1.0.0
- Initial release with core functionality
- TMDb integration
- Multiple streaming sources
- Responsive design
- Genre-based suggestions

### Planned Features
- [ ] User accounts and watchlists
- [ ] Advanced filtering options
- [ ] Subtitle download support
- [ ] Offline viewing capabilities
- [ ] Social features and ratings

---

**Disclaimer**: This application is for educational purposes only. Users are responsible for ensuring they comply with their local laws and the terms of service of the streaming sources. The developers do not host or distribute any copyrighted content.

**TMDb Attribution**: This product uses the TMDb API but is not endorsed or certified by TMDb.
