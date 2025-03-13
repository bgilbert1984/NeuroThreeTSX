# WebXR Tech Portfolio

An interactive 3D portfolio showcasing technical visualizations in both desktop and WebXR (VR/AR) experiences.

## Features

- Interactive 3D visualizations built with Three.js and React Three Fiber
- WebXR support for immersive Virtual Reality and Augmented Reality experiences
- Responsive design for both desktop and mobile devices
- Performance optimized for both high-end and low-end devices
- Fallback systems for devices without WebXR or WebGL support

## Visualizations

1. **LlamaCore** - Dynamic system health visualization with color changes and particle effects
2. **Particle System** - High-performance instanced rendering with thousands of animated particles
3. **Network Visualization** - Interactive node-based data representation with dynamic connections
4. **Terrain Mapping** - Procedural terrain with radar-style scanning and interactive manipulation
5. **Neural Network** - Interactive neural network with signal propagation and activation patterns

## Tech Stack

- **React** - UI framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **WebXR API** - For immersive VR/AR experiences
- **Framer Motion** - For animations
- **Vite** - Build tool and development server

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn
- A browser with WebXR support for testing (Chrome, Edge, Firefox)
- A WebXR compatible device for VR/AR testing (optional)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/webxr-tech-portfolio.git
   ```

2. Install dependencies:
   ```
   cd webxr-tech-portfolio
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `https://localhost:3000`

### WebXR Testing

To test WebXR features:

- For VR: Connect a VR headset to your computer and click the "Enter VR" button
- For AR: Use a compatible mobile device and click the "Enter AR" button
- For development without a headset, you can use the [WebXR Emulator Extension](https://github.com/MozillaReality/WebXR-emulator-extension)

## Build

To create a production build:

```
npm run build
```

The build will be available in the `dist` directory.

## Deployment

The application can be deployed to any static hosting service like Netlify, Vercel, GitHub Pages, etc.

Important: The server must serve the application with HTTPS and appropriate headers for WebXR to work.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Three.js for the amazing 3D graphics capabilities
- The WebXR community for pushing the boundaries of web-based immersive experiences
