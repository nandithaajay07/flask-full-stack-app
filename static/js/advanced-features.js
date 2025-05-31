// ===== ADVANCED INTERACTIVE FEATURES =====

class AdvancedFeatures {
    constructor() {
        this.initParticleBackground();
        this.initThemeToggle();
        this.initProgressIndicator();
        this.initLazyLoading();
        this.initScrollReveal();
        this.initTypingEffect();
    }

    // Particle background animation
    initParticleBackground() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-background';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 5 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
    }

    // Dark/Light theme toggle
    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Animate theme transition
                document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 300);
            });
        }
    }

    // Reading progress indicator
    initProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            document.querySelector('.reading-progress-fill').style.width = `${scrolled}%`;
        });
    }

    // Lazy loading for images
    initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Scroll reveal animations
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Typing effect for hero text
    initTypingEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    element.classList.remove('typewriter');
                }
            }, 100);
        });
    }
}

// Enhanced search functionality
class EnhancedSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchTimeout = null;
        this.initSearch();
    }

    initSearch() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideResults();
                return;
            }

            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    async performSearch(query) {
        try {
            this.showLoading();
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.displayResults(data.posts);
        } catch (error) {
            this.showError('Search failed. Please try again.');
        }
    }

    showLoading() {
        this.searchResults.classList.remove('d-none');
        this.searchResults.innerHTML = `
            <div class="text-center p-3">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Searching...</span>
            </div>
        `;
    }

    displayResults(posts) {
        if (posts.length === 0) {
            this.searchResults.innerHTML = '<div class="text-center p-3 text-muted">No results found</div>';
            return;
        }

        const html = posts.map(post => `
            <div class="search-result-item p-3 border-bottom" data-post-id="${post.id}">
                <div class="fw-bold">${this.highlightMatch(post.title)}</div>
                <div class="text-muted small">${this.truncate(post.content, 100)}</div>
                <div class="small text-secondary mt-1">
                    By ${post.author.full_name} • ${this.formatDate(post.created_at)}
                </div>
            </div>
        `).join('');

        this.searchResults.innerHTML = html;
    }

    highlightMatch(text) {
        const query = this.searchInput.value;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    showError(message) {
        this.searchResults.innerHTML = `<div class="text-center p-3 text-danger">${message}</div>`;
    }

    hideResults() {
        this.searchResults.classList.add('d-none');
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.initMonitoring();
    }

    initMonitoring() {
        this.measurePageLoad();
        this.measureCoreWebVitals();
        this.setupErrorTracking();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            };
            this.sendMetrics();
        });
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First Input Delay
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const firstInput = list.getEntries()[0];
                this.metrics.fid = firstInput.processingStart - firstInput.startTime;
            });
            observer.observe({ entryTypes: ['first-input'] });
        }

        // Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
            let clsScore = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                }
                this.metrics.cls = clsScore;
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason.message || 'Unhandled promise rejection',
                stack: event.reason.stack
            });
        });
    }

    logError(error) {
        fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(error)
        }).catch(() => {
            // Fail silently for error logging
        });
    }

    sendMetrics() {
        fetch('/api/analytics/performance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.metrics)
        }).catch(() => {
            // Fail silently for metrics
        });
    }
}

// Notification system
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.queue = [];
        this.maxNotifications = 5;
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        
        if (this.queue.length >= this.maxNotifications) {
            this.queue.shift().remove();
        }

        this.queue.push(notification);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: white;
            border-left: 4px solid ${this.getTypeColor(type)};
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 10px;
            margin-bottom: 10px;
        `;
        notification.textContent = message;
        return notification;
    }

    getTypeColor(type) {
        switch (type) {
            case 'success':
                return '#28a745';
            case 'info':
                return '#17a2b8';
            case 'warning':
                return '#ffc107';
            case 'danger':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    }

    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Real-time features with WebSocket
class RealTimeFeatures {
    constructor() {
        this.socket = null;
        this.connect();
    }

    connect() {
        // WebSocket connection for real-time features
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Reconnect after 3 seconds
            setTimeout(() => this.connect(), 3000);
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'new_comment':
                this.addNewComment(data.comment);
                break;
            case 'user_online':
                this.updateUserStatus(data.userId, true);
                break;
            case 'user_offline':
                this.updateUserStatus(data.userId, false);
                break;
        }
    }

    addNewComment(comment) {
        const commentsContainer = document.getElementById('comments');
        if (commentsContainer) {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
            
            // Animate new comment
            commentElement.style.opacity = '0';
            commentElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                commentElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                commentElement.style.opacity = '1';
                commentElement.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    createCommentElement(comment) {
        const element = document.createElement('div');
        element.className = 'comment-item';
        element.innerHTML = `
            <div class="comment-avatar">
                <img src="${comment.author.avatar}" alt="${comment.author.name}">
            </div>
            <div class="comment-content">
                <div class="comment-author">${comment.author.name}</div>
                <div class="comment-text">${comment.content}</div>
                <div class="comment-time">${this.formatTime(comment.created_at)}</div>
            </div>
        `;
        return element;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}

// Initialize advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedFeatures();
    new RealTimeFeatures();
    new PerformanceMonitor();
    new NotificationSystem();
}); 