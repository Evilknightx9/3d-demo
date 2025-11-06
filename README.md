# Portfolio Website

A modern, responsive portfolio website with 3D animations and interactive elements.

## Features

- **Modern Design**: Clean black UI with purple accent colors
- **3D Animations**: Three.js powered 3D cubes and geometric shapes
- **Particle Effects**: Animated particle background
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Performance Optimized**: Automatic performance detection and optimization
- **Smooth Animations**: Throttled scroll events and optimized animations

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Three.js (3D graphics)
- Anime.js (Animations)

## File Structure

```
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # Main JavaScript functionality
├── particles.js        # Particle animation system
├── cubes-animation.js  # Three.js cube animations
├── import-3d.js        # 3D model loader and geometric shapes
├── hero-video.mp4      # Hero section background video
├── project-image.png   # Project card images
└── README.md           # This file
```

## Performance Optimizations

- Automatic device performance detection
- Reduced particle/object counts on mobile devices
- Throttled scroll and mouse events
- Frame skipping on low-end devices
- Optimized pixel ratio for mobile
- Support for `prefers-reduced-motion`

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-website
```

2. Start a local server:

Using Python:
```bash
python -m http.server 8080
```

Or using Node.js:
```bash
npx http-server -p 8080
```

3. Open your browser and navigate to:
```
http://localhost:8080
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Author

Creative Developer Portfolio

