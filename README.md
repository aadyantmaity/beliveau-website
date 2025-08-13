# Beliveau 3D Visualizer

An advanced React-based web application for interactive 3D visualization of large-scale scientific datasets. This tool enables researchers and data scientists to explore CSV data containing spatial coordinates and intensity values in an immersive 3D environment with real-time rendering capabilities.

## Overview

The Beliveau 3D Visualizer is designed specifically for scientific data exploration, featuring:

- **High-performance rendering** for datasets up to 500,000+ points
- **Interactive 3D visualization** using Three.js and React Three Fiber
- **Multiple dataset sizes** from 50 to 500,000 observations
- **Intelligent sampling** for optimal performance on large datasets
- **Professional scientific interface** with data analysis tools

## Features

- **High-Performance 3D Visualization**:
  - Plot CSV data points in 3D space using Three.js
  - Instanced rendering for large datasets (500,000+ points)
  - Optimized performance with intelligent geometry detail adjustment
- **Interactive Controls**:
  - Mouse rotation and zoom with smooth damping
  - Real-time point information display
  - Professional camera controls
- **Advanced Color Modes**:
  - Intensity-based coloring with HSL color mapping
  - Uniform coloring for consistent visualization
  - Dynamic color scaling based on data ranges
- **Multi-Scale Dataset Support**:
  - Built-in datasets from 50 to 500,000 observations
  - Intelligent random sampling for large datasets (75k from 500k)
  - Optimized rendering strategies for each dataset size
- **Scientific Interface**:
  - Professional control panel with dataset information
  - Real-time point count display
  - Performance mode selection
- **Responsive Design**: Full-screen immersive experience optimized for scientific workflows

## Data Format

The application expects CSV files with the following columns:

- `centroid_x`: X-coordinate of data points
- `centroid_y`: Y-coordinate of data points
- `centroid_z`: Z-coordinate of data points
- `mean_intensity-0`: First intensity value
- `mean_intensity-1`: Second intensity value
- `mean_intensity-2`: Third intensity value (used for coloring)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd beliveau-website
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:1800](http://localhost:1800) to view it in the browser.

## Usage

1. **Select Dataset**: Choose from the available dataset sizes (50 to 500,000 observations)
2. **Adjust Visualization**:
   - Select color mode (intensity-based or uniform)
   - The 500k dataset automatically samples 75k random points for optimal performance
3. **Interact with 3D View**:
   - Mouse drag to rotate the view
   - Mouse scroll to zoom in/out
   - Real-time point count display in the control panel
4. **Performance Optimization**: The system automatically adjusts rendering quality based on dataset size

## Controls

- **Mouse Drag**: Rotate the 3D view
- **Mouse Scroll**: Zoom in/out
- **Hover**: Show point information
- **Click**: Select points for detailed view

## Technologies Used

- **React 19**: Modern frontend framework with hooks
- **Three.js**: Advanced 3D graphics library
- **React Three Fiber**: React renderer for Three.js with optimized performance
- **React Three Drei**: Professional helpers and utilities for React Three Fiber
- **PapaParse**: High-performance CSV parsing library
- **Modern JavaScript**: ES6+ features for optimal performance

## Project Structure

```
src/
├── components/
│   └── CSV3DVisualizer.js    # Main 3D visualization component
├── App.js                    # Main app component
├── App.css                   # App styles
└── index.css                 # Global styles
public/
└── sample_data.csv          # Sample dataset
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Customization

You can customize the visualization by modifying the `CSV3DVisualizer.js` component:

- Change point sizes and shapes
- Modify color schemes
- Add additional interactive features
- Adjust lighting and camera settings

## License

This project is open source and available under the MIT License.
