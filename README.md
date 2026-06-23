# ArduPilot Mission Planner GCS - Flood Rescue Drone System

A high-fidelity, interactive Ground Control Station (GCS) simulation console replicating the desktop **ArduPilot Mission Planner** application. Built entirely with clean, vanilla HTML, CSS, and JavaScript, it simulates a multi-drone search-and-rescue mission in a flooded area.

---

## 🚀 Live Demo
The application is hosted live via GitHub Pages. You can access it here:
👉 **[https://poojametri.github.io/mission_planner_drone/](https://poojametri.github.io/mission_planner_drone/)**

---

## 🌟 Key Features

### 1. Unified Navigation Tabs
Navigate between screens exactly like the desktop ArduPilot client while maintaining the underlying simulation states:
*   **DATA**: Flight data dashboards with HUD telemetry gauges, messages terminal logs, and live maps.
*   **PLAN**: Waypoints configuration panel with file management (JSON export/import) and parameters table.
*   **SETUP**: Firmware frame installs supporting interactive progress bars.
*   **CONFIG**: Planner configuration menus for measurements conversion, OSD styling, and map-follow toggles.
*   **SIMULATION**: SITL (Software-in-the-loop) options for speed scale factors and frame spawners.
*   **HELP**: Brief documentation guides.

### 2. Interactive Map Waypoint Planning (`PLAN` view)
*   **Click to Plan**: Click on the satellite tactical map to place custom waypoint flags (`WP1`, `WP2`, etc.) connected by path lines.
*   **Waypoint Table**: View, add, and delete waypoints dynamically. Edit coordinates and altitudes directly within the table inputs.
*   **EEPROM Mocking**: Load and Save planned waypoint grids to local JSON files. Click **Write WPs** to update the simulated flight plan.

### 3. Dynamic Vehicle Models (`SETUP` view)
*   Simulate installing different vehicle firmwares (Copter, Rover, Plane, Sub).
*   Uploading firmware changes the simulated drone avatar drawn on the map canvas:
    *   **Copter**: Quadcopter frame with rotating rotor lines.
    *   **Rover**: 4-wheel buggy frame.
    *   **Plane**: Fuselage and sweeping wing shapes.
    *   **Sub**: Deep-sea inspection ROV capsule.

### 4. Telemetry Conversions & UI Options (`CONFIG` view)
*   **Units System**: Change Distance/Altitude (Meters vs Feet) and Speed (m/s, Knots, mph). Telescopic HUD tape grids, quick metrics, and cards update measurements instantly.
*   **Custom Themes**: Toggle between Classic Slate (Dark), Kermit Green, or Orange Warning styles.
*   **Telemetry Speech**: Speech announcements synthesis matching system events.
*   **Map Follow**: Camera follow panning focusing the canvas view on the active drone in flight.

---

## 🛠️ Local Installation & Run

Since the front-end runs on standard HTML5 canvas and vanilla scripting, no compilation or npm builds are necessary:

1.  Clone this repository:
    ```bash
    git clone https://github.com/PoojaMetri/mission_planner_drone.git
    cd mission_planner_drone
    ```
2.  Simply open `/website/index.html` directly in any web browser, or serve it using Python's static server:
    ```bash
    cd website
    python -m http.server 8080
    ```
    Then open **[http://localhost:8080](http://localhost:8080)**.

---

## 📈 Automated Deployment Workflow
This project utilizes a **GitHub Actions CI/CD pipeline** to deploy the static interface automatically:
*   Whenever a push is made to the `main` branch, the workflow inside `.github/workflows/static.yml` triggers.
*   It packages the `/website` folder contents and deploys them directly to the `github-pages` environment.
