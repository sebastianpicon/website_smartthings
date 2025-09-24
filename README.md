# SmartThings PWA 🔋⚡

A modern Progressive Web App that monitors your device's battery status and provides useful system information with a beautiful, responsive interface.

## ✨ Features

- **Battery Monitoring**: Real-time battery percentage, charging status, and time estimates
- **Real Weather Data**: GPS-based weather with temperature, humidity, UV index, and conditions
- **Advanced Calculator**: Scientific and calculus calculator with history (separate page)
- **System Information**: Browser, platform, screen resolution, memory usage, and online status
- **Multiple Themes**: Choose from 5 beautiful color themes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Analog & Digital Clock**: Beautiful time display with both formats
- **PWA Features**: Installable, works offline, background sync
- **Quick Actions**: Fullscreen mode, sharing, and refresh functionality

## 🚀 Live Demo

Visit the live app: [SmartThings PWA](https://sebastianpicon.github.io/website_smartthings/)

## 📱 Installation

### As a PWA:
1. Visit the website on your mobile device or desktop
2. Look for the "Install" prompt or banner
3. Click "Install" to add it to your home screen/desktop
4. Enjoy the native app experience!

### Manual Installation:
1. Clone this repository:
   ```bash
   git clone https://github.com/sebastianpicon/website_smartthings.git
   ```
2. Open `index.html` in your browser
3. Or serve it using a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and PWA manifest
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **JavaScript ES6+**: Modern JavaScript with async/await, modules
- **Service Workers**: Offline functionality and caching
- **Battery API**: Device battery status monitoring
- **Geolocation API**: GPS positioning for weather data
- **Open-Meteo API**: Real weather data integration
- **Web Share API**: Native sharing capabilities
- **Fullscreen API**: Immersive fullscreen experience

## 🎨 Themes

Choose from 5 carefully crafted themes:
- **Default**: Dark blue gradient
- **Ocean**: Blue ocean vibes
- **Forest**: Natural green tones
- **Sunset**: Warm orange/red gradient
- **Purple**: Royal purple gradient

## 📊 Battery API

The app uses the Battery Status API to provide:
- Current battery percentage
- Charging/discharging status
- Time until fully charged
- Time until battery depleted
- Visual battery indicator

*Note: Battery API support varies by browser and platform*

## 🔧 Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari (limited Battery API support)
- ✅ Edge
- ✅ Mobile browsers

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Works without internet connection
- **Background Sync**: Updates when connection is restored
- **Push Notifications**: (Ready for implementation)
- **App-like Experience**: Full-screen, no browser chrome

## 🚀 Deployment

### GitHub Pages (Automatic)
1. Fork this repository
2. Go to Settings > Pages
3. Select "GitHub Actions" as the source
4. The site will be automatically deployed on every push to main/master

### Manual Deployment
Upload all files to any static hosting service:
- Netlify
- Vercel
- Firebase Hosting
- Surge.sh
- Your own web server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/sebastianpicon/website_smartthings/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible about your environment and the issue

## 🔮 Future Features

- [ ] Weather alerts and notifications
- [ ] More system information (CPU usage, etc.)
- [ ] Customizable dashboard layout
- [ ] Push notifications for battery alerts
- [ ] Data export functionality
- [ ] More theme options
- [ ] Widget customization
- [ ] Calculator improvements and more modes

## 📸 Screenshots

### Desktop View
![Desktop Screenshot](assets/screenshot-desktop.png)

### Mobile View
![Mobile Screenshot](assets/screenshot-mobile.png)

---

Made with ❤️ and ⚡ by Sebastian Picon

*Enjoy monitoring your battery in style!* 🔋✨