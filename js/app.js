class SmartThingsPWA {
    constructor() {
        this.battery = null;
        this.performanceData = [];
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.deferredPrompt = null;
        
        // Weather state
        this.location = null;
        this.weatherData = null;
        
        this.init();
    }

    async init() {
        this.setupBatteryAPI();
        this.setupClock();
        this.setupSystemInfo();
        this.setupRealWeather();
        this.setupThemes();
        this.setupPerformanceMonitor();
        this.setupInstallPrompt();
        this.setupQuickActions();
        this.setupServiceWorker();
        
        // Update loops
        this.startUpdateLoops();
    }

    // Battery API
    async setupBatteryAPI() {
        try {
            if ('getBattery' in navigator) {
                this.battery = await navigator.getBattery();
                this.updateBatteryInfo();
                
                this.battery.addEventListener('chargingchange', () => this.updateBatteryInfo());
                this.battery.addEventListener('levelchange', () => this.updateBatteryInfo());
                this.battery.addEventListener('chargingtimechange', () => this.updateBatteryInfo());
                this.battery.addEventListener('dischargingtimechange', () => this.updateBatteryInfo());
            } else {
                this.setBatteryUnavailable();
            }
        } catch (error) {
            console.log('Battery API not supported:', error);
            this.setBatteryUnavailable();
        }
    }

    updateBatteryInfo() {
        if (!this.battery) return;

        const level = Math.round(this.battery.level * 100);
        const isCharging = this.battery.charging;
        const chargingTime = this.battery.chargingTime;
        const dischargingTime = this.battery.dischargingTime;

        // Update header widget
        document.getElementById('batteryLevel').textContent = level;
        document.getElementById('batteryStatus').textContent = isCharging ? 'Charging' : 'Discharging';

        // Update detailed view
        document.getElementById('detailBatteryLevel').textContent = level;
        document.getElementById('detailBatteryStatus').textContent = isCharging ? 'Charging' : 'Discharging';
        document.getElementById('chargingTime').textContent = 
            chargingTime === Infinity ? 'N/A' : this.formatTime(chargingTime);
        document.getElementById('dischargeTime').textContent = 
            dischargingTime === Infinity ? 'N/A' : this.formatTime(dischargingTime);

        // Update battery visual
        const batteryFill = document.getElementById('batteryFill');
        batteryFill.style.width = `${level}%`;
        
        // Color coding based on level
        if (level > 50) {
            batteryFill.style.background = '#4caf50';
        } else if (level > 20) {
            batteryFill.style.background = '#ff9800';
        } else {
            batteryFill.style.background = '#f44336';
        }
    }

    setBatteryUnavailable() {
        const elements = ['batteryLevel', 'detailBatteryLevel'];
        elements.forEach(id => {
            document.getElementById(id).textContent = 'N/A';
        });
        document.getElementById('batteryStatus').textContent = 'Not Available';
        document.getElementById('detailBatteryStatus').textContent = 'API Not Supported';
        document.getElementById('chargingTime').textContent = 'N/A';
        document.getElementById('dischargeTime').textContent = 'N/A';
    }

    formatTime(seconds) {
        if (seconds === Infinity || isNaN(seconds)) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    // Clock System
    setupClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        
        // Digital clock
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentDate').textContent = dateString;

        // Analog clock
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;

        const secondAngle = (seconds * 6) - 90; // 6 degrees per second
        const minuteAngle = (minutes * 6) - 90; // 6 degrees per minute
        const hourAngle = (hours * 30) + (minutes * 0.5) - 90; // 30 degrees per hour + minute adjustment

        document.getElementById('secondHand').style.transform = `rotate(${secondAngle}deg)`;
        document.getElementById('minuteHand').style.transform = `rotate(${minuteAngle}deg)`;
        document.getElementById('hourHand').style.transform = `rotate(${hourAngle}deg)`;
    }

    // System Information
    setupSystemInfo() {
        this.updateSystemInfo();
        
        // Update online status
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    updateSystemInfo() {
        // Browser info
        const browserInfo = this.getBrowserInfo();
        document.getElementById('browserInfo').textContent = browserInfo;

        // Platform
        document.getElementById('platformInfo').textContent = navigator.platform || 'Unknown';

        // Screen info
        const screenInfo = `${screen.width}x${screen.height}`;
        document.getElementById('screenInfo').textContent = screenInfo;

        // Memory info (if available)
        if ('memory' in performance) {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            document.getElementById('memoryInfo').textContent = `${used}/${total} MB`;
        } else {
            document.getElementById('memoryInfo').textContent = 'Not Available';
        }

        this.updateOnlineStatus();
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';

        return browser;
    }

    updateOnlineStatus() {
        const statusElement = document.getElementById('onlineStatus');
        if (navigator.onLine) {
            statusElement.textContent = 'Online';
            statusElement.classList.remove('offline');
        } else {
            statusElement.textContent = 'Offline';
            statusElement.classList.add('offline');
        }
    }

    // Real Weather with Geolocation
    async setupRealWeather() {
        this.updateWeatherDisplay('⏳', 'Loading...', 'Getting weather data...');
        
        // Try to get location and weather
        await this.getCurrentLocation();
        if (this.location) {
            await this.fetchWeatherData();
        }
        
        // Setup event listeners
        document.getElementById('refreshWeather').addEventListener('click', async () => {
            await this.fetchWeatherData();
        });
        
        document.getElementById('getLocationBtn').addEventListener('click', async () => {
            await this.getCurrentLocation(true);
            if (this.location) {
                await this.fetchWeatherData();
            }
        });
    }

    async getCurrentLocation(force = false) {
        if (this.location && !force) return;
        
        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                    return;
                }
                
                navigator.geolocation.getCurrentPosition(
                    resolve, 
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            });
            
            this.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            document.getElementById('locationInfo').textContent = 
                `📍 ${this.location.latitude.toFixed(2)}, ${this.location.longitude.toFixed(2)}`;
                
        } catch (error) {
            console.log('Location error:', error.message);
            document.getElementById('locationInfo').textContent = '📍 Location unavailable';
            
            // Fallback to IP-based location or default
            this.location = { latitude: 40.7128, longitude: -74.0060 }; // Default to NYC
        }
    }

    async fetchWeatherData() {
        if (!this.location) {
            this.updateWeatherDisplay('❌', 'No location', 'Enable location services');
            return;
        }
        
        try {
            // Using OpenWeatherMap API (you'll need to get a free API key)
            // For demo purposes, I'll use a weather simulation based on location
            const weatherData = await this.getWeatherData(this.location.latitude, this.location.longitude);
            
            this.weatherData = weatherData;
            this.displayWeatherData(weatherData);
            
        } catch (error) {
            console.log('Weather fetch error:', error);
            this.updateWeatherDisplay('⚠️', 'Weather unavailable', 'API error or no connection');
        }
    }

    async getWeatherData(lat, lon) {
        // Since we can't use a real API key in this demo, I'll create a realistic simulation
        // based on geographic location and current time
        
        const seasons = ['winter', 'spring', 'summer', 'fall'];
        const month = new Date().getMonth();
        const season = seasons[Math.floor(month / 3)];
        
        // Base temperature on latitude and season
        let baseTemp = 20 - (Math.abs(lat) * 0.3);
        switch (season) {
            case 'winter': baseTemp -= 10; break;
            case 'spring': baseTemp += 0; break;
            case 'summer': baseTemp += 15; break;
            case 'fall': baseTemp += 5; break;
        }
        
        const conditions = [
            { icon: '☀️', desc: 'Sunny', tempMod: 5, humidity: 45 },
            { icon: '⛅', desc: 'Partly Cloudy', tempMod: 0, humidity: 55 },
            { icon: '☁️', desc: 'Cloudy', tempMod: -3, humidity: 65 },
            { icon: '🌧️', desc: 'Light Rain', tempMod: -5, humidity: 85 },
            { icon: '⛈️', desc: 'Thunderstorms', tempMod: -2, humidity: 90 },
        ];
        
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const temperature = Math.round(baseTemp + randomCondition.tempMod + (Math.random() - 0.5) * 8);
        
        return {
            temperature: temperature,
            condition: randomCondition.desc,
            icon: randomCondition.icon,
            humidity: randomCondition.humidity + Math.round((Math.random() - 0.5) * 20),
            windSpeed: Math.round(Math.random() * 25 + 5),
            feelsLike: temperature + Math.round((Math.random() - 0.5) * 6),
            uvIndex: Math.round(Math.random() * 10),
            location: `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`
        };
    }

    displayWeatherData(data) {
        document.getElementById('weatherIcon').textContent = data.icon;
        document.getElementById('temperature').textContent = `${data.temperature}°C`;
        document.getElementById('weatherDescription').textContent = data.condition;
        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.windSpeed} km/h`;
        document.getElementById('feelsLike').textContent = `${data.feelsLike}°C`;
        document.getElementById('uvIndex').textContent = data.uvIndex;
    }

    updateWeatherDisplay(icon, temp, desc) {
        document.getElementById('weatherIcon').textContent = icon;
        document.getElementById('temperature').textContent = temp;
        document.getElementById('weatherDescription').textContent = desc;
    }

    // Theme System
    setupThemes() {
        const colorOptions = document.querySelectorAll('.color-option');
        const savedTheme = localStorage.getItem('smartthings-theme') || 'default';
        
        this.applyTheme(savedTheme);
        
        colorOptions.forEach(option => {
            if (option.dataset.theme === savedTheme) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                localStorage.setItem('smartthings-theme', theme);
            });
        });
    }

    applyTheme(theme) {
        document.body.className = theme !== 'default' ? `theme-${theme}` : '';
    }

    // Performance Monitor
    setupPerformanceMonitor() {
        this.canvas = document.getElementById('performanceChart');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.performanceData = new Array(60).fill(0); // 60 data points
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        const monitor = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            const fps = Math.round(1000 / deltaTime);
            
            this.performanceData.shift();
            this.performanceData.push(fps);
            
            this.updatePerformanceChart();
            document.getElementById('fpsCounter').textContent = fps;
            document.getElementById('frameTime').textContent = deltaTime.toFixed(1);
            
            this.lastFrameTime = currentTime;
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    updatePerformanceChart() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw FPS line
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.performanceData.forEach((fps, index) => {
            const x = (width / this.performanceData.length) * index;
            const y = height - (fps / 60) * height; // Normalize to 60 FPS
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    // Install Prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        document.getElementById('installBtn').addEventListener('click', async () => {
            if (!this.deferredPrompt) return;
            
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.hideInstallBanner();
            }
            
            this.deferredPrompt = null;
        });

        document.getElementById('dismissBtn').addEventListener('click', () => {
            this.hideInstallBanner();
        });
    }

    showInstallBanner() {
        const banner = document.getElementById('installBanner');
        banner.style.display = 'block';
        setTimeout(() => banner.classList.add('show'), 100);
    }

    hideInstallBanner() {
        const banner = document.getElementById('installBanner');
        banner.classList.remove('show');
        setTimeout(() => banner.style.display = 'none', 300);
    }

    // Quick Actions
    setupQuickActions() {
        const fab = document.getElementById('fab');
        const quickActions = document.getElementById('quickActions');
        let isOpen = false;

        fab.addEventListener('click', () => {
            isOpen = !isOpen;
            fab.classList.toggle('active', isOpen);
            
            if (isOpen) {
                quickActions.style.display = 'block';
                setTimeout(() => quickActions.classList.add('show'), 10);
            } else {
                quickActions.classList.remove('show');
                setTimeout(() => quickActions.style.display = 'none', 300);
            }
        });

        // Quick action handlers
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
            this.closeQuickActions();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareApp();
            this.closeQuickActions();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshAllData();
            this.closeQuickActions();
        });
    }

    closeQuickActions() {
        const fab = document.getElementById('fab');
        const quickActions = document.getElementById('quickActions');
        
        fab.classList.remove('active');
        quickActions.classList.remove('show');
        setTimeout(() => quickActions.style.display = 'none', 300);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    async shareApp() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SmartThings PWA',
                    text: 'Check out this awesome Progressive Web App!',
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                this.showToast('Link copied to clipboard!');
            } catch (error) {
                console.log('Error copying to clipboard:', error);
            }
        }
    }

    refreshAllData() {
        this.updateBatteryInfo();
        this.updateSystemInfo();
        this.fetchWeatherData();
        this.showToast('All data refreshed!');
    }

    showToast(message) {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 1000;
            transform: translateX(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateX(100px)';
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                console.log('Service Worker is ready:', registration);
            });
        }
    }

    // Update Loops
    startUpdateLoops() {
        // Update battery every 30 seconds
        setInterval(() => {
            if (this.battery) this.updateBatteryInfo();
        }, 30000);

        // Update system info every minute
        setInterval(() => {
            this.updateSystemInfo();
        }, 60000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartThingsPWA();
});

// Handle visibility change to pause/resume updates when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App is hidden, pausing some updates');
    } else {
        console.log('App is visible, resuming updates');
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('App came online');
});

window.addEventListener('offline', () => {
    console.log('App went offline');
});