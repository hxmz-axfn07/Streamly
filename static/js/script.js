class StreamAggregator {
    constructor() {
        this.currentSelection = null;
        this.currentSources = [];
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindPlayerEvents();
        this.setupAutoSuggest();
        this.loadRandomSuggestions('trending'); // Load initial suggestions
        this.setupGenreTabs();
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        document.getElementById('seasonSelect').addEventListener('change', () => this.loadEpisodes());
        document.getElementById('episodeSelect').addEventListener('change', () => this.loadSources());
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('subtitleBtn').addEventListener('click', () => this.toggleSubtitles());
    }

    bindPlayerEvents() {
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://www.vidking.net' || typeof event.data !== 'string') return;

            try {
                const message = JSON.parse(event.data);
                if (message.type !== 'PLAYER_EVENT' || !message.data) return;

                const data = message.data;
                if (!['timeupdate', 'pause', 'seeked', 'ended'].includes(data.event)) return;
                if (!Number.isFinite(data.currentTime) || data.currentTime < 0) return;

                const key = this.progressKey(data.mediaType, data.id, data.season, data.episode);
                if (data.event === 'ended') {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, String(Math.floor(data.currentTime)));
                }
            } catch (error) {
                console.warn('Ignored malformed player event.', error);
            }
        });
    }

    progressKey(mediaType, id, season, episode) {
        return `streamly:vidking:${mediaType}:${id}:${season || 0}:${episode || 0}`;
    }

    setupAutoSuggest() {
        const searchInput = document.getElementById('searchInput');
        const suggestions = document.getElementById('suggestions');
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                suggestions.style.display = 'none';
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.getSuggestions(query);
            }, 300);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                suggestions.style.display = 'none';
            }
        });
    }

    // NEW: Setup genre tabs functionality
    setupGenreTabs() {
        const genreTabs = document.querySelectorAll('.genre-tab');
        genreTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                genreTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                // Load suggestions for selected genre
                const genre = tab.dataset.genre;
                this.loadRandomSuggestions(genre);
            });
        });
    }

    // NEW: Load random suggestions by genre
    async loadRandomSuggestions(genre) {
        const suggestionsContainer = document.getElementById('randomSuggestions');
        suggestionsContainer.innerHTML = '<div class="loading-suggestions">Loading suggestions...</div>';
        
        try {
            const response = await fetch(`/api/suggestions/${genre}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayRandomSuggestions(data.results);
            } else {
                throw new Error(data.error || 'Failed to load suggestions');
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
            suggestionsContainer.innerHTML = '<div class="error-message">Failed to load suggestions. Please try again.</div>';
        }
    }

    // NEW: Display random suggestions
    displayRandomSuggestions(suggestions) {
        const container = document.getElementById('randomSuggestions');
        
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions">No suggestions available.</div>';
            return;
        }

        const suggestionsHTML = suggestions.map(item => {
            const title = item.title || item.name;
            const year = item.release_date || item.first_air_date 
                ? new Date(item.release_date || item.first_air_date).getFullYear()
                : 'N/A';
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            const posterPath = item.poster_path 
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : 'https://via.placeholder.com/300x450?text=No+Image';
            const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
            
            return `
                <div class="suggestion-card" onclick="app.selectSuggestion(${item.id}, '${mediaType}', '${title.replace(/'/g, "\\'")}')">
                    <img src="${posterPath}" alt="${title}" class="suggestion-poster" loading="lazy">
                    <div class="suggestion-info">
                        <h3 class="suggestion-title">${title}</h3>
                        <div class="suggestion-meta">
                            <span class="suggestion-year">${year}</span>
                            <span class="suggestion-rating">⭐ ${rating}</span>
                        </div>
                        <div class="media-type-badge badge-${mediaType}">${mediaType.toUpperCase()}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = suggestionsHTML;
    }

    async getSuggestions(query) {
        try {
            const mediaType = document.getElementById('mediaType').value;
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${mediaType}`);
            const data = await response.json();
            
            this.displaySuggestions(data.results.slice(0, 5));
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    displaySuggestions(results) {
        const suggestions = document.getElementById('suggestions');
        
        if (results.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = results.map(item => {
            const title = item.title || item.name;
            const year = item.release_date || item.first_air_date;
            const posterPath = item.poster_path 
                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                : 'https://via.placeholder.com/40x60?text=No+Image';
            
            return `
                <div class="suggestion-item" onclick="app.selectSuggestion(${item.id}, '${item.media_type || (item.title ? 'movie' : 'tv')}', '${title.replace(/'/g, "\\'")}')">
                    <img src="${posterPath}" alt="${title}">
                    <div class="suggestion-info">
                        <div class="suggestion-title">${title}</div>
                        <div class="suggestion-year">${year ? new Date(year).getFullYear() : 'N/A'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        suggestions.style.display = 'block';
    }

    selectSuggestion(id, mediaType, title) {
        document.getElementById('searchInput').value = title;
        document.getElementById('suggestions').style.display = 'none';
        
        // Hide suggestions section when content is selected
        const suggestionsSection = document.querySelector('.suggestions-section');
        if (suggestionsSection) {
            suggestionsSection.style.display = 'none';
        }
        
        this.loadContent(id, mediaType);
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const mediaType = document.getElementById('mediaType').value;
        
        if (!query) return;
        
        this.showLoading(true);
        
        // Hide suggestions section during search
        const suggestionsSection = document.querySelector('.suggestions-section');
        if (suggestionsSection) {
            suggestionsSection.style.display = 'none';
        }
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${mediaType}`);
            const data = await response.json();
            this.displaySearchResults(data.results);
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        
        if (results.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">No results found.</p>';
            return;
        }

        container.innerHTML = results.map(item => {
            const title = item.title || item.name;
            const year = item.release_date || item.first_air_date;
            const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
            const posterPath = item.poster_path 
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : 'https://via.placeholder.com/200x300?text=No+Image';
            
            return `
                <div class="result-item" onclick="app.loadContent(${item.id}, '${mediaType}')">
                    <img src="${posterPath}" alt="${title}">
                    <div class="media-type-badge badge-${mediaType}">${mediaType.toUpperCase()}</div>
                    <h3>${title}</h3>
                    <p>${year ? new Date(year).getFullYear() : 'N/A'}</p>
                </div>
            `;
        }).join('');
    }

    async loadContent(id, mediaType) {
        this.showLoading(true);
        this.currentSelection = { id, mediaType };
        
        try {
            const response = await fetch(`/api/${mediaType}/${id}`);
            const data = await response.json();
            
            if (mediaType === 'tv') {
                await this.setupTVShow(data);
            } else {
                await this.setupMovie(data);
            }
        } catch (error) {
            console.error('Error loading content:', error);
            alert('Failed to load content details.');
        } finally {
            this.showLoading(false);
        }
    }

    async setupMovie(movieData) {
        document.getElementById('episodeSelector').style.display = 'none';
        await this.loadMoviePlayer(movieData.id);
    }

    async setupTVShow(tvData) {
        await this.loadSeasons(tvData.id);
        document.getElementById('episodeSelector').style.display = 'block';
    }

    async loadSeasons(tvId) {
        try {
            const response = await fetch(`/api/tv/${tvId}/seasons`);
            const data = await response.json();
            
            const seasonSelect = document.getElementById('seasonSelect');
            seasonSelect.innerHTML = '<option value="">Select Season</option>';
            
            data.seasons.forEach(season => {
                if (season.season_number >= 0) {
                    seasonSelect.innerHTML += `
                        <option value="${season.season_number}">
                            Season ${season.season_number} (${season.episode_count} episodes)
                        </option>
                    `;
                }
            });
        } catch (error) {
            console.error('Error loading seasons:', error);
        }
    }

    async loadEpisodes() {
        const seasonNumber = document.getElementById('seasonSelect').value;
        if (!seasonNumber) return;

        try {
            const response = await fetch(`/api/tv/${this.currentSelection.id}/season/${seasonNumber}/episodes`);
            const data = await response.json();
            
            const episodeSelect = document.getElementById('episodeSelect');
            episodeSelect.innerHTML = '<option value="">Select Episode</option>';
            
            data.episodes.forEach(episode => {
                episodeSelect.innerHTML += `
                    <option value="${episode.episode_number}">
                        Episode ${episode.episode_number}: ${episode.name}
                    </option>
                `;
            });
        } catch (error) {
            console.error('Error loading episodes:', error);
        }
    }

    async loadSources() {
        const season = document.getElementById('seasonSelect').value;
        const episode = document.getElementById('episodeSelect').value;
        
        if (!season || !episode) return;
        
        await this.loadTVPlayer(this.currentSelection.id, season, episode);
    }

    async loadMoviePlayer(tmdbId) {
        this.showLoading(true);
        try {
            const progress = Number(localStorage.getItem(this.progressKey('movie', tmdbId))) || 0;
            const response = await fetch('/api/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdb_id: tmdbId, media_type: 'movie', progress }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load player');
            this.displayPlayer(data.player);
        } catch (error) {
            console.error('Error loading movie player:', error);
            alert('Failed to load player.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadTVPlayer(tmdbId, season, episode) {
        this.showLoading(true);
        try {
            const progress = Number(localStorage.getItem(this.progressKey('tv', tmdbId, season, episode))) || 0;
            const response = await fetch('/api/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdb_id: tmdbId, media_type: 'tv', season, episode, progress }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load player');
            this.displayPlayer(data.player);
        } catch (error) {
            console.error('Error loading TV player:', error);
            alert('Failed to load player.');
        } finally {
            this.showLoading(false);
        }
    }

    displayPlayer(player) {
        const container = document.getElementById('sources');
        container.innerHTML = '<p class="player-status">Vidking Player ready. Resume progress saved on this device.</p>';
        document.getElementById('sourceSelector').style.display = 'block';
        this.loadVideo(player);
    }

    loadVideo(player) {
        const videoPlayer = document.getElementById('videoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        const videoContainer = document.getElementById('videoContainer');
        const url = new URL(player.url);
        Object.entries(player.params).forEach(([key, value]) => url.searchParams.set(key, value));
        videoPlayer.src = url.toString();
        videoTitle.textContent = `Now Playing - ${player.name}`;
        videoContainer.style.display = 'block';
        
        // Scroll to video
        videoContainer.scrollIntoView({ behavior: 'smooth' });
    }

    toggleFullscreen() {
        const videoPlayer = document.getElementById('videoPlayer');
        
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
    }

    toggleSubtitles() {
        // This would typically interact with the video player's subtitle controls
        // Since we're using iframes, we'll show a message
        alert('Subtitle controls are available within the video player. Look for CC or subtitle buttons in the player interface.');
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    // NEW: Refresh suggestions function
    refreshSuggestions() {
        const activeTab = document.querySelector('.genre-tab.active');
        const genre = activeTab ? activeTab.dataset.genre : 'trending';
        this.loadRandomSuggestions(genre);
    }
}

// Initialize the app
const app = new StreamAggregator();

// Additional utility functions
function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close suggestions
    if (e.key === 'Escape') {
        document.getElementById('suggestions').style.display = 'none';
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});
