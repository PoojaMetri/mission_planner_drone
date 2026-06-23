# Drone Path Simulation using Dijkstra's Algorithm

This Python simulation demonstrates how drones can efficiently plan their routes using Dijkstra's algorithm. The project simulates automated drone path planning for package delivery by calculating the shortest path between source and destination points and visualizing the drone's movement in a graphical interface.

## Project Overview

This simulation shows how drones can leverage Dijkstra's algorithm to:
- Calculate the shortest path between a source and destination
- Visualize the drone's movement on a graphical grid
- Simulate automated path planning in real-time for delivery scenarios
- Allow users to work with either predefined or custom nodes
- Display real-time path calculations and visualizations of the optimal route

## Features

### Two Modes of Operation:
- **Predefined nodes**: Use a set of predefined nodes and their distances to calculate the shortest path.
- **Custom nodes**: Define your own nodes and distances to simulate specific delivery routes.

### Interactive Environment:
- Select source and destination points
- Specify distances between nodes (edges)
- Graphically display the calculated path

### Real-Time Dijkstra’s Algorithm Implementation:
- Clear path visualization showing the drone’s optimal route from start to destination
- Calculation of total distance and visualization of the drone's movement along the shortest path

### Visual Components:
- **Blue dot**: Drone's current position
- **Red cells**: Obstacles (locations the drone cannot pass through)
- **Green cell**: Start point
- **Yellow cell**: Destination
- **Purple line**: Calculated shortest path

## Technology Stack
- **Python**
- **Matplotlib**: For graphical visualization
- **NetworkX**: For graph operations and pathfinding
- **NumPy**: For calculations and data handling

## How to Use

### Option 1: Google Colab
1. Download this repository.
2. Upload `drone_path_simulation.ipynb` to Google Colab.
3. Run the notebook to interact with the simulation.

### Option 2: Local Jupyter Notebook
1. Download this repository.
2. Install Jupyter Notebook if you haven't already.
3. Open and run `drone_path_simulation.ipynb` in your local Jupyter environment.

## Sample Output
The simulation will display:
- A grid representing the area with nodes (start, destination, obstacles)
- The calculated shortest path between the start and destination
- The drone’s movement along the calculated path in real-time
- Final statistics, including the total path distance and time required to traverse the route

## Acknowledgments
- **Contributors**: Steve Nsabimana, Euunice Sayubu, Lagrace Divine Igirubuntu
- **Inspiration**: Based on real-world drone delivery systems and inspired by Dijkstra's shortest path algorithm.
- **Libraries Used**: NetworkX, Matplotlib, NumPy
