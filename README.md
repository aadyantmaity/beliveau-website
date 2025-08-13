# Beliveau Website - 3D CSV Visualizer

A React-based web application for visualizing CSV data in 3D space with interactive features. This project allows users to upload and explore CSV data containing spatial coordinates and intensity values in an immersive 3D environment.

## Features

- **3D Visualization**: Plot CSV data points in 3D space using Three.js
- **Interactive Controls**: 
  - Mouse rotation and zoom
  - Point hovering for detailed information
  - Point selection and highlighting
- **Multiple Color Modes**: 
  - Intensity-based coloring
  - Position-based coloring
  - Uniform coloring
- **File Upload**: Upload your own CSV files
- **Sample Data**: Built-in sample dataset for testing
- **Responsive Design**: Full-screen immersive experience

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

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. **Load Sample Data**: Click "Load Sample Data" to visualize the included sample dataset
2. **Upload Your Data**: Use the file upload button to load your own CSV file
3. **Change Color Mode**: Select different coloring schemes from the dropdown
4. **Interact with Points**: 
   - Hover over points to see intensity values
   - Click points to select them and view detailed information
   - Use mouse to rotate and zoom the view

## Controls

- **Mouse Drag**: Rotate the 3D view
- **Mouse Scroll**: Zoom in/out
- **Hover**: Show point information
- **Click**: Select points for detailed view

## Technologies Used

- **React**: Frontend framework
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber
- **PapaParse**: CSV parsing library

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
