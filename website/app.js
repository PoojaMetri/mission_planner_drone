// Flood Rescue Drone System - Mission Planner GCS Simulation Controller

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // -------------------------------------------------------------
    // 1. DOM Elements & State Setup
    // -------------------------------------------------------------
    const canvas = document.getElementById('simulation-canvas');
    const ctx = canvas.getContext('2d');
    
    const hudCanvas = document.getElementById('hud-canvas');
    const hudCtx = hudCanvas.getContext('2d');
    
    // GCS Connection Bar Controls
    const btnConnect = document.getElementById('btn-connect');
    const selectCom = document.getElementById('select-com');
    const selectBaud = document.getElementById('select-baud');
    
    // Tab Elements (Left Sidebar)
    const tabSelectorButtons = document.querySelectorAll('.tab-selector-btn');
    const tabViewPanels = document.querySelectorAll('.tab-view');
    
    // Quick Telemetry Readings
    const quickAlt = document.getElementById('quick-alt');
    const quickSpeed = document.getElementById('quick-speed');
    const quickDistWp = document.getElementById('quick-distwp');
    const quickYaw = document.getElementById('quick-yaw');
    const quickVspeed = document.getElementById('quick-vspeed');
    const quickBattery = document.getElementById('quick-battery');
    
    // GCS Buttons
    const btnArm = document.getElementById('btn-arm');
    const btnAuto = document.getElementById('btn-auto');
    const btnGuided = document.getElementById('btn-guided');
    const btnRtl = document.getElementById('btn-rtl');
    const btnLand = document.getElementById('btn-land');
    
    const btnSpawn = document.getElementById('btn-spawn');
    const btnDeploy = document.getElementById('btn-deploy');
    const btnClearMission = document.getElementById('btn-clear-mission');
    const btnReset = document.getElementById('btn-reset');
    const btnClearLogs = document.getElementById('btn-clear-logs');
    
    const logsContainer = document.getElementById('terminal-logs-container');
    const cursorCoords = document.getElementById('map-cursor-coords');
    const heroArmState = document.getElementById('hero-arm-state');
    
    // Map Footer Telemetry Segments
    const telemSats = document.getElementById('telemetry-sats');
    const telemLink = document.getElementById('telemetry-link');
    const telemHdop = document.getElementById('telemetry-hdop');
    
    // Zoom Slider Controls
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const zoomHandle = document.querySelector('.zoom-handle');

    // Telemetry DOM Rows
    const d1Mode = document.getElementById('d1-mode');
    const d1Gps = document.getElementById('d1-gps');
    const d1Battery = document.getElementById('d1-battery');
    const d1BatteryText = document.getElementById('d1-battery-text');
    const d1Voltage = document.getElementById('d1-voltage');
    
    const d2Mode = document.getElementById('d2-mode');
    const d2Gps = document.getElementById('d2-gps');
    const d2Battery = document.getElementById('d2-battery');
    const d2BatteryText = document.getElementById('d2-battery-text');
    const d2Voltage = document.getElementById('d2-voltage');
    
    const d3Mode = document.getElementById('d3-mode');
    const d3Gps = document.getElementById('d3-gps');
    const d3Battery = document.getElementById('d3-battery');
    const d3BatteryText = document.getElementById('d3-battery-text');
    const d3Voltage = document.getElementById('d3-voltage');

    // New Multi-View Panels Elements
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sidebarData = document.getElementById('sidebar-data');
    const sidebarPlan = document.getElementById('sidebar-plan');
    const mapArea = document.getElementById('map-area');
    const panelWaypoint = document.getElementById('panel-waypoint');
    const panelSimulationSitl = document.getElementById('panel-simulation-sitl');
    const panelSetup = document.getElementById('panel-setup');
    const panelConfig = document.getElementById('panel-config');
    const panelHelp = document.getElementById('panel-help');

    // PLAN view Elements
    const wpTableBody = document.querySelector('#wp-table tbody');
    const wpRadiusInput = document.getElementById('wp-radius');
    const wpDefaultAltInput = document.getElementById('wp-default-alt');
    const btnLoadWp = document.getElementById('btn-load-wp');
    const btnSaveWp = document.getElementById('btn-save-wp');
    const btnReadWp = document.getElementById('btn-read-wp');
    const btnWriteWp = document.getElementById('btn-write-wp');
    const homeLatInput = document.getElementById('home-lat');
    const homeLngInput = document.getElementById('home-lng');
    const homeAslInput = document.getElementById('home-asl');

    // SETUP view Elements
    const firmwareCards = document.querySelectorAll('.firmware-card');
    const uploadProgress = document.getElementById('upload-progress');
    const progressTitle = document.getElementById('progress-title');
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.getElementById('progress-status');
    const setupSubMenuBtns = document.querySelectorAll('[data-setup-tab]');

    // CONFIG view Elements
    const configOsdColor = document.getElementById('config-osd-color');
    const configLanguage = document.getElementById('config-language');
    const configDistUnits = document.getElementById('config-dist-units');
    const configSpeedUnits = document.getElementById('config-speed-units');
    const configMapFollow = document.getElementById('config-map-follow');
    const configTheme = document.getElementById('config-theme');
    const configSpeech = document.getElementById('config-speech');
    const configSpeechLevel = document.getElementById('config-speech-level');
    const configSubMenuBtns = document.querySelectorAll('[data-config-tab]');

    // SITL simulation Elements
    const simSpeedSelect = document.getElementById('sim-speed');
    const sitlHeadingInput = document.getElementById('sitl-heading');
    const sitlVehicleTypeSelect = document.getElementById('sitl-vehicle-type');
    const btnSitlLaunch = document.getElementById('btn-sitl-launch');
    const btnSitlWipe = document.getElementById('btn-sitl-wipe');

    // Canvas Limits (Interactive Map Viewport)
    let mapWidth = 800;
    let mapHeight = 480;
    const BASE_STATION = { x: 100, y: 240 };
    
    // HUD size constants
    hudCanvas.width = 320;
    hudCanvas.height = 210;

    // Simulation States
    let isConnected = false;
    let isArmed = false;
    let flightMode = 'STABILIZE'; // STABILIZE, AUTO, GUIDED, RTL, LAND
    let survivors = [];
    let customWaypoints = []; // Stores { x, y, alt }
    let guidedTarget = null;
    let zoomFactor = 1.0; // Dynamic scale zoom
    
    // Configuration & Simulation settings
    let simulatedVehicleType = 'copter'; // copter, rover, plane, sub
    let distUnitSetting = 'meters'; // meters, feet
    let speedUnitSetting = 'm_s'; // m_s, knots, mph
    let themeSetting = 'dark';
    let mapFollowEnabled = false;
    let voiceEnabled = true;
    let voiceSeverity = 'warning';
    let simSpeedScale = 1;
    let defaultAltitudeVal = 100;
    let osdColorSetting = 'green';

    // Map offset coordinates for scrolling / panning
    let mapOffsetX = 0;
    let mapOffsetY = 0;
    
    // Hardcoded obstacles
    let obstacles = [
        { x: 260, y: 120, r: 25, label: "Submerged Roof" },
        { x: 420, y: 320, r: 35, label: "Power Pylon" },
        { x: 600, y: 160, r: 30, label: "Debris Block" },
        { x: 340, y: 380, r: 20, label: "Flooded Trees" },
        { x: 680, y: 360, r: 25, label: "Submerged Vehicle" }
    ];

    // Default Grid search coordinates (used if no custom waypoints are set)
    const defaultWaypoints = [
        { x: 200, y: 80, alt: 100 },
        { x: 350, y: 80, alt: 100 },
        { x: 350, y: 400, alt: 100 },
        { x: 500, y: 400, alt: 100 },
        { x: 500, y: 80, alt: 100 },
        { x: 650, y: 80, alt: 100 },
        { x: 650, y: 400, alt: 100 },
        { x: 740, y: 400, alt: 100 },
        { x: 740, y: 80, alt: 100 }
    ];

    // Drones Telemetry and Flight Parameters
    const drones = {
        scout: {
            id: 'd1',
            name: 'Scout',
            x: BASE_STATION.x,
            y: BASE_STATION.y,
            targetX: BASE_STATION.x,
            targetY: BASE_STATION.y,
            altitude: 0, 
            speed: 0,    
            heading: 0,  
            pitch: 0,    
            roll: 0,     
            battery: 100,
            waypointIndex: 0,
            radarAngle: 0,
            radarSweep: 60,
            color: 'var(--gcs-cyan)'
        },
        deliveryA: {
            id: 'd2',
            name: 'Delivery A',
            x: BASE_STATION.x - 25,
            y: BASE_STATION.y - 25,
            homeX: BASE_STATION.x - 25,
            homeY: BASE_STATION.y - 25,
            targetX: BASE_STATION.x - 25,
            targetY: BASE_STATION.y - 25,
            speed: 3.5,
            battery: 100,
            mode: 'DISARMED', 
            targetSurvivor: null,
            payloadProgress: 0,
            color: 'var(--gcs-blue)'
        },
        deliveryB: {
            id: 'd3',
            name: 'Delivery B',
            x: BASE_STATION.x - 25,
            y: BASE_STATION.y + 25,
            homeX: BASE_STATION.x - 25,
            homeY: BASE_STATION.y + 25,
            targetX: BASE_STATION.x - 25,
            targetY: BASE_STATION.y + 25,
            speed: 3.5,
            battery: 100,
            mode: 'DISARMED',
            targetSurvivor: null,
            payloadProgress: 0,
            color: 'var(--gcs-purple)'
        }
    };

    // Resize handlers for fitting responsive container sizes
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        mapWidth = canvas.width;
        mapHeight = canvas.height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // -------------------------------------------------------------
    // View Switching Layout Logic
    // -------------------------------------------------------------
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewName = btn.textContent.trim().toUpperCase();

            // Hide all layout sections first
            sidebarData.style.display = 'none';
            sidebarPlan.style.display = 'none';
            mapArea.style.display = 'none';
            panelWaypoint.style.display = 'none';
            panelSimulationSitl.style.display = 'none';
            panelSetup.style.display = 'none';
            panelConfig.style.display = 'none';
            panelHelp.style.display = 'none';

            // Show sections based on selected tab
            if (viewName.includes('DATA')) {
                sidebarData.style.display = 'flex';
                mapArea.style.display = 'flex';
            } else if (viewName.includes('PLAN')) {
                sidebarPlan.style.display = 'flex';
                mapArea.style.display = 'flex';
                panelWaypoint.style.display = 'flex';
                updateWaypointTable();
            } else if (viewName.includes('SETUP')) {
                panelSetup.style.display = 'flex';
            } else if (viewName.includes('CONFIG')) {
                panelConfig.style.display = 'flex';
            } else if (viewName.includes('SIMULATION')) {
                mapArea.style.display = 'flex';
                panelSimulationSitl.style.display = 'flex';
            } else if (viewName.includes('HELP')) {
                panelHelp.style.display = 'flex';
            }

            // Trigger canvas resizing to fill parent workspace properly
            setTimeout(resizeCanvas, 50);
        });
    });

    // -------------------------------------------------------------
    // 2. Logging Engine
    // -------------------------------------------------------------
    function logEvent(sender, message, type = 'info') {
        const time = new Date();
        const stamp = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
        
        let colorClass = 'text-cyan';
        if (sender.includes('SYSTEM')) colorClass = 'text-cyan';
        else if (sender.includes('SCOUT')) colorClass = 'text-cyan';
        else if (sender.includes('DELIVERY A')) colorClass = 'text-blue';
        else if (sender.includes('DELIVERY B')) colorClass = 'text-purple';
        
        if (type === 'success') colorClass = 'text-green';
        if (type === 'warning') colorClass = 'text-orange';
        if (type === 'danger') colorClass = 'text-red';

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}-entry`;
        entry.innerHTML = `
            <span class="log-timestamp">[${stamp}]</span>
            <span class="log-msg"><span class="${colorClass}">[${sender}]</span> ${message}</span>
        `;
        
        logsContainer.appendChild(entry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    // -------------------------------------------------------------
    // 3. Tab Switching Mechanism
    // -------------------------------------------------------------
    tabSelectorButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabSelectorButtons.forEach(btn => btn.classList.remove('active'));
            tabViewPanels.forEach(panel => panel.classList.remove('active'));
            
            button.classList.add('active');
            const activePanel = document.getElementById(button.dataset.tab);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
    });

    // -------------------------------------------------------------
    // 4. Connection State Machine
    // -------------------------------------------------------------
    btnConnect.addEventListener('click', () => {
        if (!isConnected) {
            // Establish Connection
            isConnected = true;
            const comPort = selectCom.value;
            const baud = selectBaud.value;
            
            btnConnect.innerHTML = `<i data-lucide="plug-2" class="btn-icon"></i> DISCONNECT`;
            btnConnect.className = "connect-btn connected";
            
            // Enable primary GCS Actions buttons
            btnArm.disabled = false;
            btnSpawn.disabled = false;
            btnReset.disabled = false;
            
            // Update MAVLink footer values
            telemLink.innerText = "CONNECTED";
            telemLink.className = "text-green";
            telemSats.innerText = "14";
            telemSats.className = "text-green";
            telemHdop.innerText = "1.2";
            telemHdop.className = "text-green";
            
            logEvent('SYSTEM', `Link established on port ${comPort} at ${baud} baud.`, 'success');
            logEvent('SYSTEM', 'MAVLink telemetry packets active. Arm checklist green.', 'info');
        } else {
            // Terminate connection
            isConnected = false;
            
            btnConnect.innerHTML = `<i data-lucide="plug" class="btn-icon"></i> CONNECT`;
            btnConnect.className = "connect-btn disconnected";
            
            // Disarm vehicles immediately on disconnect
            if (isArmed) {
                btnArm.click();
            }
            
            // Disable actions
            btnArm.disabled = true;
            btnSpawn.disabled = true;
            btnDeploy.disabled = true;
            
            // Reset footer values
            telemLink.innerText = "DISCONNECTED";
            telemLink.className = "text-red";
            telemSats.innerText = "0";
            telemSats.className = "text-red";
            telemHdop.innerText = "0.0";
            telemHdop.className = "text-muted";
            
            logEvent('SYSTEM', 'MAVLink link closed. GCS telemetry offline.', 'danger');
        }
        if (window.lucide) window.lucide.createIcons();
    });

    // -------------------------------------------------------------
    // 5. Waypoints Custom Planning & Click INTERCEPTION
    // -------------------------------------------------------------
    function updateWaypointTable() {
        wpTableBody.innerHTML = '';
        const activeWps = customWaypoints;
        
        activeWps.forEach((wp, index) => {
            const tr = document.createElement('tr');
            
            // Format Lat / Lng to mock coordinates
            const lat = (42.3489 + (wp.y / 5000)).toFixed(5);
            const lng = (-71.1023 - (wp.x / 5000)).toFixed(5);
            
            tr.innerHTML = `
                <td>WP${index + 1}</td>
                <td>WAYPOINT</td>
                <td><input type="number" value="${wp.alt || 100}" class="wp-alt-input" data-index="${index}" style="width: 50px; background: #1a1a1a; border: 1px solid #333; color: #fff; text-align: center; font-size: 0.72rem; padding: 2px 4px; border-radius: 3px;"></td>
                <td>${lat}° N</td>
                <td>${lng}° W</td>
                <td><button class="btn-del-wp" data-index="${index}"><i data-lucide="trash-2" style="width: 12px; height: 12px; color: var(--gcs-red);"></i></button></td>
            `;
            wpTableBody.appendChild(tr);
        });

        // Add event listeners to input changes and delete button clicks
        document.querySelectorAll('.wp-alt-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = parseInt(e.target.value) || 100;
                customWaypoints[idx].alt = val;
                logEvent('SYSTEM', `Waypoint ${idx + 1} altitude updated to ${val}m.`, 'info');
            });
        });

        document.querySelectorAll('.btn-del-wp').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnElem = e.currentTarget;
                const idx = parseInt(btnElem.dataset.index);
                customWaypoints.splice(idx, 1);
                logEvent('SYSTEM', `Removed Waypoint ${idx + 1}.`, 'info');
                updateWaypointTable();
            });
        });

        if (window.lucide) window.lucide.createIcons();
    }

    // Save planned waypoints as a downloadable JSON file
    btnSaveWp.addEventListener('click', () => {
        if (customWaypoints.length === 0) {
            logEvent('SYSTEM', 'Cannot save mission: No waypoint coordinates planned.', 'warning');
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customWaypoints, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mission_plan.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        logEvent('SYSTEM', 'Mission plan exported to mission_plan.json', 'success');
    });

    // Load waypoints file
    btnLoadWp.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (Array.isArray(parsed)) {
                        customWaypoints = parsed.map(wp => ({
                            x: wp.x,
                            y: wp.y,
                            alt: wp.alt || 100
                        }));
                        logEvent('SYSTEM', `Successfully loaded ${customWaypoints.length} waypoints from file.`, 'success');
                        updateWaypointTable();
                    } else {
                        throw new Error("Invalid waypoint file structure.");
                    }
                } catch (err) {
                    logEvent('SYSTEM', `Failed to load file: ${err.message}`, 'danger');
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });

    // Write waypoints to vehicle
    btnWriteWp.addEventListener('click', () => {
        if (!isConnected) {
            logEvent('SYSTEM', 'GCS Connection required to write waypoints.', 'warning');
            return;
        }
        logEvent('SYSTEM', `Sending MAVLink mission write packet...`, 'info');
        setTimeout(() => {
            logEvent('SYSTEM', `Wrote ${customWaypoints.length} custom waypoints to vehicle EEPROM. Autopilot database updated.`, 'success');
        }, 800);
    });

    // Read waypoints from vehicle
    btnReadWp.addEventListener('click', () => {
        if (!isConnected) {
            logEvent('SYSTEM', 'GCS Connection required to read waypoints.', 'warning');
            return;
        }
        logEvent('SYSTEM', `Sending MAVLink mission read request...`, 'info');
        setTimeout(() => {
            // Mocks downloading waypoints from drone (resets to default waypoints in simulation)
            customWaypoints = defaultWaypoints.map(wp => ({ ...wp }));
            logEvent('SYSTEM', `Read ${customWaypoints.length} waypoints from vehicle. Planning table re-aligned.`, 'success');
            updateWaypointTable();
        }, 800);
    });

    // -------------------------------------------------------------
    // SETUP View Firmware Installer Logic
    // -------------------------------------------------------------
    firmwareCards.forEach(card => {
        card.addEventListener('click', () => {
            if (isArmed) {
                logEvent('SYSTEM', 'Block command: Cannot install firmware while motors are ARMED!', 'danger');
                return;
            }

            const fwType = card.dataset.firmware;
            let titleText = "Uploading ArduCopter firmware...";
            let vehicleName = "Quadcopter";
            if (fwType === 'rover') {
                titleText = "Uploading ArduRover firmware...";
                vehicleName = "Ground Rover";
            } else if (fwType === 'plane') {
                titleText = "Uploading ArduPlane firmware...";
                vehicleName = "Fixed-wing Plane";
            } else if (fwType === 'sub') {
                titleText = "Uploading ArduSub firmware...";
                vehicleName = "Underwater ROV";
            }

            progressTitle.innerText = titleText;
            uploadProgress.style.display = 'block';
            progressFill.style.width = '0%';
            progressStatus.innerText = "Connecting to board bootloader...";

            // Simulate progress load
            let progressVal = 0;
            const statusSteps = [
                { limit: 20, text: "Erasing flash sectors..." },
                { limit: 50, text: "Uploading firmware blocks..." },
                { limit: 80, text: "Verifying checksum verification..." },
                { limit: 95, text: "Configuring default parameter tree..." },
                { limit: 100, text: "Firmware upload complete. Rebooting vehicle controller..." }
            ];

            const interval = setInterval(() => {
                progressVal += Math.random() * 8 + 2;
                if (progressVal >= 100) {
                    progressVal = 100;
                    progressFill.style.width = '100%';
                    clearInterval(interval);
                    
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        simulatedVehicleType = fwType;
                        logEvent('SYSTEM', `Firmware upload successful. ${vehicleName} profile loaded.`, 'success');
                        logEvent('SYSTEM', `Autopilot configuration reset to defaults. Ready.`, 'info');
                    }, 500);
                } else {
                    progressFill.style.width = `${progressVal}%`;
                    const currentStatus = statusSteps.find(s => progressVal <= s.limit);
                    if (currentStatus) {
                        progressStatus.innerText = currentStatus.text;
                    }
                }
            }, 150);
        });
    });

    // -------------------------------------------------------------
    // CONFIG View planner settings bindings
    // -------------------------------------------------------------
    configOsdColor.addEventListener('change', (e) => {
        osdColorSetting = e.target.value;
        logEvent('SYSTEM', `OSD layout color changed to ${osdColorSetting}.`, 'info');
    });

    configDistUnits.addEventListener('change', (e) => {
        distUnitSetting = e.target.value;
        logEvent('SYSTEM', `Altitude units changed to ${distUnitSetting}.`, 'info');
        updateHUDUnitsLabels();
    });

    configSpeedUnits.addEventListener('change', (e) => {
        speedUnitSetting = e.target.value;
        logEvent('SYSTEM', `Velocity units changed to ${speedUnitSetting === 'm_s' ? 'm/s' : speedUnitSetting}.`, 'info');
        updateHUDUnitsLabels();
    });

    configMapFollow.addEventListener('change', (e) => {
        mapFollowEnabled = e.target.checked;
        logEvent('SYSTEM', `Map Follow tracking ${mapFollowEnabled ? 'ENABLED' : 'DISABLED'}.`, 'info');
    });

    configTheme.addEventListener('change', (e) => {
        themeSetting = e.target.value;
        document.body.classList.remove('theme-kermit', 'theme-orange');
        if (themeSetting === 'kermit') document.body.classList.add('theme-kermit');
        if (themeSetting === 'orange') document.body.classList.add('theme-orange');
        logEvent('SYSTEM', `App theme switched to ${themeSetting}.`, 'success');
    });

    configSpeech.addEventListener('change', (e) => {
        voiceEnabled = e.target.checked;
        logEvent('SYSTEM', `OSD speech synthesizers ${voiceEnabled ? 'ACTIVE' : 'MUTED'}.`, 'info');
    });

    configSpeechLevel.addEventListener('change', (e) => {
        voiceSeverity = e.target.value;
        logEvent('SYSTEM', `Speech warnings threshold updated to: ${voiceSeverity}.`, 'info');
    });

    // Helper to update units indicators in DOM
    function updateHUDUnitsLabels() {
        const altUnits = document.querySelectorAll('.quick-telemetry-grid .quick-unit');
        altUnits[0].innerText = distUnitSetting === 'meters' ? 'm' : 'ft'; // Altitude
        altUnits[1].innerText = speedUnitSetting === 'm_s' ? 'm/s' : (speedUnitSetting === 'knots' ? 'kt' : 'mph'); // Speed
        altUnits[2].innerText = distUnitSetting === 'meters' ? 'm' : 'ft'; // Dist to WP
        altUnits[3].innerText = speedUnitSetting === 'm_s' ? 'm/s' : (speedUnitSetting === 'knots' ? 'kt' : 'mph'); // VSpeed
    }

    // Config sub-tabs toggles
    configSubMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            configSubMenuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            logEvent('SYSTEM', `Displaying ${btn.textContent.trim()} sheet.`, 'info');
        });
    });

    // Setup sub-tabs toggles
    setupSubMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setupSubMenuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            logEvent('SYSTEM', `Displaying ${btn.textContent.trim()} installer sheet.`, 'info');
        });
    });

    // -------------------------------------------------------------
    // SITL Simulation Options
    // -------------------------------------------------------------
    simSpeedSelect.addEventListener('change', (e) => {
        simSpeedScale = parseInt(e.target.value) || 1;
        logEvent('SYSTEM', `SITL simulation speed factor updated: ${simSpeedScale}x.`, 'warning');
    });

    btnSitlLaunch.addEventListener('click', () => {
        if (!isConnected) {
            logEvent('SYSTEM', 'Cannot launch SITL: Ground station is offline.', 'danger');
            return;
        }
        
        const type = sitlVehicleTypeSelect.value;
        simulatedVehicleType = type;
        
        logEvent('SYSTEM', `Spawning SITL instance [model=${type}]...`, 'info');
        setTimeout(() => {
            logEvent('SYSTEM', `SITL launch success: Booted ArduPilot simulated core.`, 'success');
            // If disarmed, armed automatically
            if (!isArmed) {
                btnArm.click();
            }
        }, 1000);
    });

    btnSitlWipe.addEventListener('click', () => {
        logEvent('SYSTEM', `Wiping virtual EEPROM storage...`, 'warning');
        setTimeout(() => {
            customWaypoints = [];
            survivors = [];
            logEvent('SYSTEM', `EEPROM wipe complete. Parameters reset to factory values.`, 'success');
            if (isArmed) btnArm.click();
            updateWaypointTable();
        }, 1200);
    });

    canvas.addEventListener('click', (e) => {
        if (!isConnected) {
            logEvent('SYSTEM', 'GCS Connection required to click plan waypoints.', 'warning');
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const screenX = Math.round((e.clientX - rect.left) * scaleX);
        const screenY = Math.round((e.clientY - rect.top) * scaleY);

        // Convert clicked screen coordinates to zoomed/scanned logical coordinates
        const x = Math.round((screenX - canvas.width / 2) / zoomFactor + canvas.width / 2 - mapOffsetX);
        const y = Math.round((screenY - canvas.height / 2) / zoomFactor + canvas.height / 2 - mapOffsetY);

        if (!isArmed) {
            // Place custom waypoint coordinates inside maps bounds
            if (x < 30 || x > mapWidth - 30 || y < 30 || y > mapHeight - 30) {
                return;
            }
            for (let obs of obstacles) {
                if (Math.hypot(x - obs.x, y - obs.y) < obs.r) {
                    logEvent('SYSTEM', `Cannot place waypoint: Collision hazard detected at (${x}, ${y}).`, 'danger');
                    return;
                }
            }
            const defaultAlt = parseInt(wpDefaultAltInput.value) || 100;
            customWaypoints.push({ x, y, alt: defaultAlt });
            logEvent('SYSTEM', `Added Waypoint ${customWaypoints.length} at Map Vector (${x}, ${y}), altitude: ${defaultAlt}m.`, 'success');
            updateWaypointTable();
        } else {
            if (flightMode === 'GUIDED') {
                guidedTarget = { x, y };
                drones.scout.targetX = x;
                drones.scout.targetY = y;
                logEvent('SCOUT', `Guided mission vector updated: Fly-To (${x}, ${y}).`, 'warning');
            } else {
                logEvent('SYSTEM', 'Block command: Select GUIDED flight mode to override autopilot vectors.', 'warning');
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const screenX = Math.round((e.clientX - rect.left) * scaleX);
        const screenY = Math.round((e.clientY - rect.top) * scaleY);
        
        const x = Math.round((screenX - canvas.width / 2) / zoomFactor + canvas.width / 2 - mapOffsetX);
        const y = Math.round((screenY - canvas.height / 2) / zoomFactor + canvas.height / 2 - mapOffsetY);

        const lat = (42.3489 + (y / 5000)).toFixed(5);
        const lng = (-71.1023 - (x / 5000)).toFixed(5);
        cursorCoords.innerText = `GPS: ${lat}° N, ${lng}° W (Vector: ${x}, ${y})`;
    });

    // Zoom buttons handling
    btnZoomIn.addEventListener('click', () => {
        zoomFactor = Math.min(2.0, zoomFactor + 0.15);
        updateZoomHandlePosition();
    });

    btnZoomOut.addEventListener('click', () => {
        zoomFactor = Math.max(0.5, zoomFactor - 0.15);
        updateZoomHandlePosition();
    });

    function updateZoomHandlePosition() {
        // Map 0.5 to 2.0 zoom onto 10% to 90% top offset of slider
        const percent = ((zoomFactor - 0.5) / 1.5) * 80 + 10;
        zoomHandle.style.top = `${100 - percent}%`;
    }

    // -------------------------------------------------------------
    // 6. Action Control Operations
    // -------------------------------------------------------------
    btnArm.addEventListener('click', () => {
        if (!isConnected) return;
        
        if (!isArmed) {
            isArmed = true;
            btnArm.innerText = "DISARM VEHICLE";
            btnArm.className = "gcs-action-btn btn-arm armed-active";
            heroArmState.innerText = "ARMED";
            heroArmState.className = "hud-val text-green";
            
            // Unlock flight mode switch keys
            setFlightModeControls(true);
            
            drones.scout.altitude = 0;
            drones.scout.speed = 0;
            drones.deliveryA.mode = 'IDLE';
            drones.deliveryB.mode = 'IDLE';
            
            logEvent('SYSTEM', 'ARMING motors. Standard pre-flight checklists passed.', 'danger');
            logEvent('SCOUT', 'Engaging thrust. Ascending to search altitude loop.', 'success');
            
            if (customWaypoints.length > 0) {
                switchFlightMode('AUTO');
            } else {
                switchFlightMode('STABILIZE');
            }
        } else {
            isArmed = false;
            btnArm.innerText = "ARM VEHICLE";
            btnArm.className = "gcs-action-btn btn-arm disarmed";
            heroArmState.innerText = "DISARMED";
            heroArmState.className = "hud-val text-red";
            
            setFlightModeControls(false);
            
            drones.scout.altitude = 0;
            drones.scout.speed = 0;
            drones.scout.pitch = 0;
            drones.scout.roll = 0;
            
            drones.deliveryA.mode = 'DISARMED';
            drones.deliveryB.mode = 'DISARMED';
            
            switchFlightMode('STABILIZE');
            logEvent('SYSTEM', 'DISARMING vehicle immediately.', 'danger');
        }
    });

    btnAuto.addEventListener('click', () => switchFlightMode('AUTO'));
    btnGuided.addEventListener('click', () => switchFlightMode('GUIDED'));
    btnRtl.addEventListener('click', () => switchFlightMode('RTL'));
    btnLand.addEventListener('click', () => switchFlightMode('LAND'));

    function setFlightModeControls(enabled) {
        btnAuto.disabled = !enabled;
        btnGuided.disabled = !enabled;
        btnRtl.disabled = !enabled;
        btnLand.disabled = !enabled;
    }

    function switchFlightMode(mode) {
        if (!isArmed) return;
        flightMode = mode;
        
        const modeButtons = [btnAuto, btnGuided, btnRtl, btnLand];
        modeButtons.forEach(btn => btn.classList.remove('active-mode'));
        
        if (mode === 'AUTO') btnAuto.classList.add('active-mode');
        if (mode === 'GUIDED') btnGuided.classList.add('active-mode');
        if (mode === 'RTL') btnRtl.classList.add('active-mode');
        if (mode === 'LAND') btnLand.classList.add('active-mode');
        
        logEvent('SYSTEM', `Flight mode changed to ${mode}.`, 'info');
        
        if (mode === 'RTL') {
            drones.scout.targetX = BASE_STATION.x;
            drones.scout.targetY = BASE_STATION.y;
            logEvent('SCOUT', 'RTL triggered: Navigating return vectors to HQ Base pad.', 'warning');
        }
        if (mode === 'LAND') {
            logEvent('SCOUT', 'Enforcing immediate altitude descent landing block.', 'warning');
        }
    }

    btnSpawn.addEventListener('click', () => {
        if (!isConnected) return;
        
        let x, y, isInsideObstacle;
        let attempts = 0;
        
        do {
            isInsideObstacle = false;
            x = Math.floor(Math.random() * (mapWidth - 200)) + 100;
            y = Math.floor(Math.random() * (mapHeight - 100)) + 50;
            
            for (let obs of obstacles) {
                if (Math.hypot(x - obs.x, y - obs.y) < obs.r + 20) {
                    isInsideObstacle = true;
                    break;
                }
            }
            attempts++;
        } while (isInsideObstacle && attempts < 50);

        const newSurvivor = {
            id: `VICTIM_${String(survivors.length + 1).padStart(2, '0')}`,
            x: x,
            y: y,
            status: 'UNDETECTED', 
            pulseRadius: 0
        };

        survivors.push(newSurvivor);
        logEvent('SYSTEM', `Unclassified thermal signature registered at GPS: X_${x} Y_${y}`, 'warning');
        updateButtons();
    });

    btnDeploy.addEventListener('click', () => {
        if (!isConnected) return;
        
        const pendingSurvivor = survivors.find(s => s.status === 'PENDING');
        if (!pendingSurvivor) return;

        const availableDrone = getAvailableDeliveryDrone(pendingSurvivor.x, pendingSurvivor.y);
        
        if (availableDrone) {
            availableDrone.mode = 'DISPATCHED';
            availableDrone.targetSurvivor = pendingSurvivor;
            availableDrone.targetX = pendingSurvivor.x;
            availableDrone.targetY = pendingSurvivor.y;
            pendingSurvivor.status = 'DELIVERING';
            
            logEvent(availableDrone.name.toUpperCase(), `Dispatched to coordinates X_${pendingSurvivor.x} Y_${pendingSurvivor.y} carrying safety payload.`, 'info');
            updateButtons();
        } else {
            logEvent('SYSTEM', 'Dispatch error: All delivery units currently deployed or low battery.', 'danger');
        }
    });

    btnClearMission.addEventListener('click', () => {
        customWaypoints = [];
        logEvent('SYSTEM', 'Planned waypoint coordinates cleared.', 'info');
        if (flightMode === 'AUTO') {
            drones.scout.waypointIndex = 0;
        }
    });

    btnReset.addEventListener('click', () => {
        isArmed = false;
        flightMode = 'STABILIZE';
        survivors = [];
        customWaypoints = [];
        guidedTarget = null;
        zoomFactor = 1.0;
        updateZoomHandlePosition();
        
        btnArm.innerText = "ARM VEHICLE";
        btnArm.className = "gcs-action-btn btn-arm disarmed";
        heroArmState.innerText = "DISARMED";
        heroArmState.className = "hud-val text-red";
        
        setFlightModeControls(false);
        const modeButtons = [btnAuto, btnGuided, btnRtl, btnLand];
        modeButtons.forEach(btn => btn.classList.remove('active-mode'));

        // Reset scout
        drones.scout.x = BASE_STATION.x;
        drones.scout.y = BASE_STATION.y;
        drones.scout.targetX = BASE_STATION.x;
        drones.scout.targetY = BASE_STATION.y;
        drones.scout.battery = 100;
        drones.scout.altitude = 0;
        drones.scout.speed = 0;
        drones.scout.pitch = 0;
        drones.scout.roll = 0;
        drones.scout.waypointIndex = 0;

        // Reset delivery A
        drones.deliveryA.x = drones.deliveryA.homeX;
        drones.deliveryA.y = drones.deliveryA.homeY;
        drones.deliveryA.targetX = drones.deliveryA.homeX;
        drones.deliveryA.targetY = drones.deliveryA.homeY;
        drones.deliveryA.battery = 100;
        drones.deliveryA.mode = 'IDLE';
        drones.deliveryA.targetSurvivor = null;
        drones.deliveryA.payloadProgress = 0;

        // Reset delivery B
        drones.deliveryB.x = drones.deliveryB.homeX;
        drones.deliveryB.y = drones.deliveryB.homeY;
        drones.deliveryB.targetX = drones.deliveryB.homeX;
        drones.deliveryB.targetY = drones.deliveryB.homeY;
        drones.deliveryB.battery = 100;
        drones.deliveryB.mode = 'IDLE';
        drones.deliveryB.targetSurvivor = null;
        drones.deliveryB.payloadProgress = 0;

        logsContainer.innerHTML = '';
        logEvent('SYSTEM', 'Mission control state cleared. Simulation reset to standby.', 'info');
        
        if (window.lucide) window.lucide.createIcons();
        updateButtons();
    });

    btnClearLogs.addEventListener('click', () => {
        logsContainer.innerHTML = '';
        logEvent('SYSTEM', 'Log output buffer cleared.', 'info');
    });

    // -------------------------------------------------------------
    // 7. Simulation Core Logic Ticks
    // -------------------------------------------------------------
    function updateSimulation() {
        if (!isConnected) return;

        if (!isArmed) {
            drones.scout.speed = 0;
            drones.scout.altitude = 0;
            drones.scout.pitch = 0;
            drones.scout.roll = 0;
            
            // Deliveries stand by
            drones.deliveryA.x = drones.deliveryA.homeX;
            drones.deliveryA.y = drones.deliveryA.homeY;
            drones.deliveryB.x = drones.deliveryB.homeX;
            drones.deliveryB.y = drones.deliveryB.homeY;
            
            mapOffsetX = 0;
            mapOffsetY = 0;
            return;
        }

        // Scout updates
        const scout = drones.scout;
        scout.battery -= 0.04 * simSpeedScale; // drain battery faster with sim speed
        
        if (scout.battery <= 20 && flightMode !== 'RTL' && flightMode !== 'LAND') {
            switchFlightMode('RTL');
            logEvent('SCOUT', 'Battery low failsafe (20%). Forcing Return to Launch.', 'danger');
        }

        // Altitude takeoff
        if (scout.altitude < 120 && flightMode !== 'LAND') {
            scout.altitude += 0.8 * simSpeedScale;
            if (scout.altitude > 120) scout.altitude = 120;
        }

        // Position guidance updates
        if (flightMode === 'STABILIZE') {
            scout.speed = 0;
            scout.pitch = 0;
            scout.roll = Math.sin(Date.now() / 200) * 1.5; 
            scout.targetX = scout.x;
            scout.targetY = scout.y;
        } else if (flightMode === 'LAND') {
            scout.speed = 0;
            scout.pitch = 0;
            scout.roll = 0;
            
            if (scout.altitude > 0) {
                scout.altitude -= 1.2 * simSpeedScale;
                if (scout.altitude < 0) scout.altitude = 0;
            } else {
                scout.altitude = 0;
                // Auto-disarm
                isArmed = false;
                btnArm.innerText = "ARM VEHICLE";
                btnArm.className = "gcs-action-btn btn-arm disarmed";
                heroArmState.innerText = "DISARMED";
                heroArmState.className = "hud-val text-red";
                setFlightModeControls(false);
                const modeButtons = [btnAuto, btnGuided, btnRtl, btnLand];
                modeButtons.forEach(btn => btn.classList.remove('active-mode'));
                
                drones.deliveryA.mode = 'DISARMED';
                drones.deliveryB.mode = 'DISARMED';
                
                logEvent('SCOUT', 'Landed successfully. Autopilot disarmed motors.', 'success');
            }
        } else {
            // AUTOPILOT MODES (AUTO, RTL, GUIDED)
            let activeWps = customWaypoints.length > 0 ? customWaypoints : defaultWaypoints;
            
            if (flightMode === 'AUTO') {
                const wp = activeWps[scout.waypointIndex];
                scout.targetX = wp.x;
                scout.targetY = wp.y;
            } else if (flightMode === 'RTL') {
                scout.targetX = BASE_STATION.x;
                scout.targetY = BASE_STATION.y;
            } else if (flightMode === 'GUIDED') {
                if (guidedTarget) {
                    scout.targetX = guidedTarget.x;
                    scout.targetY = guidedTarget.y;
                } else {
                    scout.targetX = scout.x;
                    scout.targetY = scout.y;
                }
            }

            const dx = scout.targetX - scout.x;
            const dy = scout.targetY - scout.y;
            const dist = Math.hypot(dx, dy);

            const step = 2.4 * simSpeedScale;
            if (dist > step) {
                scout.speed = 12.5; 
                
                let angleDeg = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
                if (angleDeg < 0) angleDeg += 360;
                scout.heading = angleDeg;

                scout.pitch = 8; 
                scout.roll = Math.sin(Date.now() / 150) * 3; 

                // Move position
                scout.x += (dx / dist) * step;
                scout.y += (dy / dist) * step;
            } else {
                scout.x = scout.targetX;
                scout.y = scout.targetY;
                scout.speed = 0;
                scout.pitch = 0;
                scout.roll = 0;
                
                if (flightMode === 'AUTO') {
                    scout.waypointIndex = (scout.waypointIndex + 1) % activeWps.length;
                    logEvent('SCOUT', `Navigating to Waypoint ${scout.waypointIndex + 1}/${activeWps.length}.`, 'info');
                } else if (flightMode === 'RTL') {
                    switchFlightMode('LAND');
                    logEvent('SCOUT', 'Arrived home. Initializing landing sequence.', 'warning');
                } else if (flightMode === 'GUIDED') {
                    guidedTarget = null;
                }
            }

            // Radar scan sweep overlapping survivors
            scout.radarAngle += 0.04 * simSpeedScale;
            survivors.forEach(survivor => {
                if (survivor.status === 'UNDETECTED') {
                    const distToScout = Math.hypot(scout.x - survivor.x, scout.y - survivor.y);
                    if (distToScout < scout.radarSweep && scout.altitude > 40) {
                        survivor.status = 'PENDING';
                        logEvent('SCOUT', `Thermal lock established: Stranded civilian at coordinate (${Math.round(survivor.x)}, ${Math.round(survivor.y)}). Ready for dispatch.`, 'warning');
                        updateButtons();
                    }
                }
            });
        }

        // B. Update Delivery Drones
        updateDeliveryDrone(drones.deliveryA);
        updateDeliveryDrone(drones.deliveryB);

        // Update survivors pulses
        survivors.forEach(s => {
            if (s.status === 'PENDING') {
                s.pulseRadius = (s.pulseRadius + 0.4 * simSpeedScale) % 15;
            }
        });

        // Map Follow logic
        if (mapFollowEnabled && isArmed) {
            mapOffsetX = canvas.width / 2 - scout.x;
            mapOffsetY = canvas.height / 2 - scout.y;
        } else {
            mapOffsetX = 0;
            mapOffsetY = 0;
        }
    }

    function updateDeliveryDrone(drone) {
        if (drone.mode === 'DISARMED') {
            drone.x = drone.homeX;
            drone.y = drone.homeY;
            drone.battery = 100;
            return;
        }

        if (drone.mode === 'DISPATCHED') {
            drone.battery -= 0.12 * simSpeedScale;
            const dx = drone.targetX - drone.x;
            const dy = drone.targetY - drone.y;
            const dist = Math.hypot(dx, dy);
            
            const step = drone.speed * simSpeedScale;
            if (dist < step) {
                drone.x = drone.targetX;
                drone.y = drone.targetY;
                drone.mode = 'DROPPING';
                drone.payloadProgress = 0;
                logEvent(drone.name.toUpperCase(), 'Target coordinates reached. Hover stabilized. Releasing payload...', 'info');
            } else {
                drone.x += (dx / dist) * step;
                drone.y += (dy / dist) * step;
            }
        } else if (drone.mode === 'DROPPING') {
            drone.battery -= 0.05 * simSpeedScale;
            drone.payloadProgress += 1.5 * simSpeedScale;
            
            if (drone.payloadProgress >= 35) {
                drone.mode = 'RETURNING';
                drone.targetX = drone.homeX;
                drone.targetY = drone.homeY;
                
                if (drone.targetSurvivor) {
                    drone.targetSurvivor.status = 'RESCUED';
                    logEvent(drone.name.toUpperCase(), `Safety package dropped successfully at survivor node ${drone.targetSurvivor.id}.`, 'success');
                }
                updateButtons();
            }
        } else if (drone.mode === 'RETURNING') {
            drone.battery -= 0.08 * simSpeedScale;
            const dx = drone.homeX - drone.x;
            const dy = drone.homeY - drone.y;
            const dist = Math.hypot(dx, dy);
            
            const step = drone.speed * simSpeedScale;
            if (dist < step) {
                drone.x = drone.homeX;
                drone.y = drone.homeY;
                drone.mode = 'RECHARGING';
                logEvent(drone.name.toUpperCase(), 'Safely landed at base. Reconnecting to power bus.', 'info');
            } else {
                drone.x += (dx / dist) * step;
                drone.y += (dy / dist) * step;
            }
        } else if (drone.mode === 'RECHARGING') {
            drone.battery += 0.35 * simSpeedScale;
            if (drone.battery >= 100) {
                drone.battery = 100;
                drone.mode = 'IDLE';
                logEvent(drone.name.toUpperCase(), 'Battery bank topped off (100%). Operational.', 'success');
            }
        }
    }

    // -------------------------------------------------------------
    // 8. Canvas Render Loop (Map Rendering with Zoom supports)
    // -------------------------------------------------------------
    function render() {
        ctx.clearRect(0, 0, mapWidth, mapHeight);

        // A. Draw Map Elements with Scale/Zoom transformations
        ctx.save();
        
        // Translate to center, apply scale, translate back, shift by follow offset
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoomFactor, zoomFactor);
        ctx.translate(-canvas.width / 2 + mapOffsetX, -canvas.height / 2 + mapOffsetY);

        // Main flooded background fill
        ctx.fillStyle = '#070b16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines matching scale
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = -canvas.width; x < canvas.width * 2; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, -canvas.height);
            ctx.lineTo(x, canvas.height * 2);
            ctx.stroke();
        }
        for (let y = -canvas.height; y < canvas.height * 2; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(-canvas.width, y);
            ctx.lineTo(canvas.width * 2, y);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(0, 114, 255, 0.05)';
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 3, canvas.height * 3);

        // Draw HQ Base
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(BASE_STATION.x, BASE_STATION.y, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px Orbitron';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText("HQ BASE", BASE_STATION.x, BASE_STATION.y - 12);

        // Draw Obstacles
        obstacles.forEach(obs => {
            ctx.fillStyle = 'rgba(255, 59, 48, 0.07)';
            ctx.strokeStyle = 'rgba(255, 59, 48, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 59, 48, 0.7)';
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '9px Inter';
            ctx.fillStyle = '#64748b';
            ctx.fillText(obs.label, obs.x, obs.y + obs.r + 12);
        });

        // Draw Waypoint path routes
        let activeWps = customWaypoints.length > 0 ? customWaypoints : defaultWaypoints;
        if (activeWps.length > 0) {
            ctx.strokeStyle = 'rgba(255, 159, 0, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(BASE_STATION.x, BASE_STATION.y);
            activeWps.forEach(wp => ctx.lineTo(wp.x, wp.y));
            ctx.stroke();

            activeWps.forEach((wp, index) => {
                ctx.fillStyle = 'rgba(255, 159, 0, 0.15)';
                ctx.strokeStyle = 'var(--gcs-orange)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(wp.x, wp.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.font = '8px Orbitron';
                ctx.fillStyle = 'var(--text-main)';
                ctx.fillText(`WP${index+1}`, wp.x, wp.y - 12);
            });
        }

        // Draw Guided Target vector line
        if (flightMode === 'GUIDED' && guidedTarget && isArmed) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(drones.scout.x, drones.scout.y);
            ctx.lineTo(guidedTarget.x, guidedTarget.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = 'var(--gcs-cyan)';
            ctx.beginPath();
            ctx.arc(guidedTarget.x, guidedTarget.y, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw Delivery lines
        [dones => drones.deliveryA, dones => drones.deliveryB].forEach(getDrone => {
            const drone = getDrone();
            if (drone.mode === 'DISPATCHED' || drone.mode === 'DROPPING') {
                ctx.strokeStyle = drone.color + '44';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(drone.homeX, drone.homeY);
                ctx.lineTo(drone.targetX, drone.targetY);
                ctx.stroke();
            }
        });

        // Draw Survivors
        survivors.forEach(s => {
            if (s.status === 'UNDETECTED') {
                ctx.strokeStyle = 'rgba(255, 159, 0, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.fillStyle = 'rgba(255, 159, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (s.status === 'PENDING' || s.status === 'DELIVERING') {
                ctx.strokeStyle = 'rgba(255, 159, 0, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 8 + s.pulseRadius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = 'var(--gcs-orange)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(s.x - 12, s.y); ctx.lineTo(s.x + 12, s.y);
                ctx.moveTo(s.x, s.y - 12); ctx.lineTo(s.x, s.y + 12);
                ctx.stroke();

                ctx.font = '8px Orbitron';
                ctx.fillStyle = 'var(--gcs-orange)';
                ctx.fillText(s.status === 'DELIVERING' ? "DELIVERING" : "CONFIRMED_SIG", s.x, s.y - 16);
            } else if (s.status === 'RESCUED') {
                ctx.strokeStyle = 'var(--gcs-green)';
                ctx.fillStyle = 'rgba(57, 255, 20, 0.1)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = 'var(--gcs-green)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x - 4, s.y);
                ctx.lineTo(s.x - 1, s.y + 3);
                ctx.lineTo(s.x + 4, s.y - 3);
                ctx.stroke();

                ctx.font = '9px Orbitron';
                ctx.fillStyle = 'var(--gcs-green)';
                ctx.fillText("SAFE", s.x, s.y - 15);
            }
        });

        // Draw Scout Radar cone
        const scout = drones.scout;
        if (isArmed && flightMode !== 'LAND' && flightMode !== 'STABILIZE' && scout.altitude > 40) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(scout.x, scout.y, scout.radarSweep, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(scout.x, scout.y);
            ctx.lineTo(
                scout.x + scout.radarSweep * Math.cos(scout.radarAngle),
                scout.y + scout.radarSweep * Math.sin(scout.radarAngle)
            );
            ctx.stroke();
        }

        // Draw Scout quadcopter
        drawQuadcopter(scout.x, scout.y, scout.color, "SCOUT_01", isArmed ? flightMode : 'DISARMED');

        // Draw Delivery quadcopters
        const delA = drones.deliveryA;
        drawQuadcopter(delA.x, delA.y, delA.color, "DELIV_02", delA.mode);
        if (delA.mode === 'DROPPING') {
            ctx.fillStyle = '#ff9f00';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.fillRect(delA.x - 5, delA.y + delA.payloadProgress - 4, 10, 8);
            ctx.strokeRect(delA.x - 5, delA.y + delA.payloadProgress - 4, 10, 8);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(delA.x, delA.y);
            ctx.lineTo(delA.x, delA.y + delA.payloadProgress);
            ctx.stroke();
        }

        const delB = drones.deliveryB;
        drawQuadcopter(delB.x, delB.y, delB.color, "DELIV_03", delB.mode);
        if (delB.mode === 'DROPPING') {
            ctx.fillStyle = '#ff9f00';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.fillRect(delB.x - 5, delB.y + delB.payloadProgress - 4, 10, 8);
            ctx.strokeRect(delB.x - 5, delB.y + delB.payloadProgress - 4, 10, 8);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(delB.x, delB.y);
            ctx.lineTo(delB.x, delB.y + delB.payloadProgress);
            ctx.stroke();
        }

        ctx.restore(); // Restore zoom transforms
    }

    // Quadcopter Drawing Helper (Supports Copter, Rover, Plane, and Sub models!)
    function drawQuadcopter(cx, cy, color, label, mode) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        
        let type = 'copter';
        if (label === 'SCOUT_01') {
            type = simulatedVehicleType;
        }

        if (type === 'rover') {
            // Draw Ground Rover Buggy Shape
            ctx.fillStyle = '#151b2d';
            ctx.fillRect(cx - 12, cy - 8, 24, 16);
            ctx.strokeRect(cx - 12, cy - 8, 24, 16);

            // Draw 4 wheels
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            const wheels = [
                {x: cx - 12, y: cy - 11},
                {x: cx + 6, y: cy - 11},
                {x: cx - 12, y: cy + 7},
                {x: cx + 6, y: cy + 7}
            ];
            wheels.forEach(w => {
                ctx.fillRect(w.x, w.y, 6, 4);
                ctx.strokeRect(w.x, w.y, 6, 4);
            });

            // Draw center sensor eye
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx + 4, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'plane') {
            // Draw Fixed-wing Plane Shape
            ctx.fillStyle = '#151b2d';
            ctx.lineWidth = 2;

            // Wings
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy - 15);
            ctx.lineTo(cx - 3, cy + 15);
            ctx.lineTo(cx + 1, cy + 15);
            ctx.lineTo(cx + 1, cy - 15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Fuselage
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy);
            ctx.lineTo(cx + 12, cy);
            ctx.stroke();

            // Tail stabilizer
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy - 5);
            ctx.lineTo(cx - 12, cy + 5);
            ctx.stroke();

            // Nose cone dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx + 12, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'sub') {
            // Draw Submersible ROV capsule
            ctx.fillStyle = '#151b2d';
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Propellers
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - 6); ctx.lineTo(cx - 12, cy - 4);
            ctx.moveTo(cx - 8, cy + 6); ctx.lineTo(cx - 12, cy + 4);
            ctx.stroke();

            // Front search light
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx + 6, cy, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw Quadcopter Shape
            ctx.fillStyle = '#151b2d';
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx + 10, cy + 10);
            ctx.moveTo(cx - 10, cy + 10); ctx.lineTo(cx + 10, cy - 10);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            const rotors = [
                {x: cx - 10, y: cy - 10},
                {x: cx + 10, y: cy - 10},
                {x: cx - 10, y: cy + 10},
                {x: cx + 10, y: cy + 10}
            ];
            rotors.forEach(r => {
                ctx.beginPath();
                ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
                ctx.stroke();
            });

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        if (mode === 'RTL' || mode === 'LAND' || mode === 'RETURNING') {
            ctx.strokeStyle = 'var(--gcs-orange)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.font = '8px Orbitron';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy - 15);
        ctx.restore();
    }

    // -------------------------------------------------------------
    // 9. GCS HUD Sidebar Canvas Rendering
    // -------------------------------------------------------------
    function renderGcsHud() {
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        
        // Dark GCS HUD base fill
        hudCtx.fillStyle = '#0f0f0f';
        hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
        
        const scout = drones.scout;
        const hudCenter = { x: 160, y: 110 };

        // Load OSD color configuration
        let osdColor = 'var(--gcs-green)';
        if (osdColorSetting === 'cyan') osdColor = 'var(--gcs-cyan)';
        if (osdColorSetting === 'orange') osdColor = 'var(--gcs-orange)';
        if (osdColorSetting === 'white') osdColor = '#ffffff';

        // A. Horizon Attitude Indicator (Center Circle)
        hudCtx.save();
        hudCtx.translate(hudCenter.x, hudCenter.y);
        // Apply roll angle rotation (negative for horizon roll)
        hudCtx.rotate(-scout.roll * (Math.PI / 180));
        
        // Pitch displacement translation
        const pitchY = scout.pitch * 1.5;

        // Clip horizon to HUD sphere radius
        hudCtx.beginPath();
        hudCtx.arc(0, 0, 40, 0, Math.PI * 2);
        hudCtx.clip();

        // Sky background
        hudCtx.fillStyle = '#3a9ad9'; 
        hudCtx.fillRect(-70, -70 + pitchY, 140, 70);

        // Ground background
        hudCtx.fillStyle = '#7a5a3a'; 
        hudCtx.fillRect(-70, 0 + pitchY, 140, 70);

        // White horizon dividing line
        hudCtx.strokeStyle = '#ffffff';
        hudCtx.lineWidth = 2;
        hudCtx.beginPath();
        hudCtx.moveTo(-70, pitchY);
        hudCtx.lineTo(70, pitchY);
        hudCtx.stroke();

        // Pitch ticks
        hudCtx.strokeStyle = 'rgba(255,255,255,0.4)';
        hudCtx.lineWidth = 1;
        hudCtx.font = '8px monospace';
        hudCtx.textAlign = 'center';
        hudCtx.fillStyle = '#fff';
        const pitchBars = [-20, -10, 10, 20];
        pitchBars.forEach(p => {
            const barY = -p * 1.5 + pitchY;
            hudCtx.beginPath();
            hudCtx.moveTo(-15, barY); hudCtx.lineTo(15, barY);
            hudCtx.stroke();
            hudCtx.fillText(p, -24, barY + 3);
            hudCtx.fillText(p, 24, barY + 3);
        });
        hudCtx.restore();

        // Static aircraft symbol in foreground (styled with active OSD color)
        hudCtx.strokeStyle = osdColor;
        hudCtx.lineWidth = 2.5;
        hudCtx.beginPath();
        hudCtx.moveTo(hudCenter.x - 25, hudCenter.y);
        hudCtx.lineTo(hudCenter.x - 12, hudCenter.y);
        hudCtx.lineTo(hudCenter.x - 8, hudCenter.y + 5);
        hudCtx.moveTo(hudCenter.x, hudCenter.y);
        hudCtx.arc(hudCenter.x, hudCenter.y, 1.2, 0, Math.PI * 2);
        hudCtx.moveTo(hudCenter.x + 8, hudCenter.y + 5);
        hudCtx.lineTo(hudCenter.x + 12, hudCenter.y);
        hudCtx.lineTo(hudCenter.x + 25, hudCenter.y);
        hudCtx.stroke();

        // HUD Attitude Circle frame border
        hudCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        hudCtx.lineWidth = 2;
        hudCtx.beginPath();
        hudCtx.arc(hudCenter.x, hudCenter.y, 40, 0, Math.PI * 2);
        hudCtx.stroke();

        // B. Roll Dial Scale tick marks (Top arc)
        hudCtx.strokeStyle = 'rgba(255,255,255,0.4)';
        hudCtx.lineWidth = 1.5;
        hudCtx.font = '8px monospace';
        hudCtx.fillStyle = '#fff';
        hudCtx.textAlign = 'center';
        const angles = [-45, -30, -15, 0, 15, 30, 45];
        angles.forEach(ang => {
            const rad = (ang - 90) * (Math.PI / 180);
            const startX = hudCenter.x + 44 * Math.cos(rad);
            const startY = hudCenter.y + 44 * Math.sin(rad);
            const endX = hudCenter.x + 49 * Math.cos(rad);
            const endY = hudCenter.y + 49 * Math.sin(rad);
            
            hudCtx.beginPath();
            hudCtx.moveTo(startX, startY);
            hudCtx.lineTo(endX, endY);
            hudCtx.stroke();
        });

        // Roll pointer needle
        hudCtx.save();
        hudCtx.translate(hudCenter.x, hudCenter.y);
        hudCtx.rotate(-scout.roll * (Math.PI / 180));
        hudCtx.fillStyle = 'var(--gcs-cyan)';
        hudCtx.beginPath();
        hudCtx.moveTo(0, -40);
        hudCtx.lineTo(-4, -46);
        hudCtx.lineTo(4, -46);
        hudCtx.fill();
        hudCtx.restore();

        // C. Compass Horizontal Tape (Header of GCS HUD)
        hudCtx.fillStyle = 'rgba(255,255,255,0.02)';
        hudCtx.fillRect(10, 10, 300, 20);
        hudCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        hudCtx.strokeRect(10, 10, 300, 20);

        hudCtx.save();
        hudCtx.beginPath();
        hudCtx.rect(15, 10, 290, 20);
        hudCtx.clip();

        hudCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        hudCtx.font = '8px monospace';
        hudCtx.textAlign = 'center';
        hudCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        hudCtx.lineWidth = 1;
        
        const headingOffset = scout.heading % 5;
        for (let i = -20; i <= 20; i++) {
            const markHeading = (Math.round(scout.heading / 5) * 5 + i * 5 + 360) % 360;
            const markX = hudCenter.x + (i * 12) - headingOffset * 2.4;
            
            hudCtx.beginPath();
            hudCtx.moveTo(markX, 10);
            hudCtx.lineTo(markX, 15);
            hudCtx.stroke();

            if (markHeading === 0) hudCtx.fillText("N", markX, 26);
            else if (markHeading === 90) hudCtx.fillText("E", markX, 26);
            else if (markHeading === 180) hudCtx.fillText("S", markX, 26);
            else if (markHeading === 270) hudCtx.fillText("W", markX, 26);
            else if (markHeading % 30 === 0) hudCtx.fillText(markHeading, markX, 26);
        }
        hudCtx.restore();

        // Compass needle indicator
        hudCtx.fillStyle = 'var(--gcs-cyan)';
        hudCtx.beginPath();
        hudCtx.moveTo(hudCenter.x, 10);
        hudCtx.lineTo(hudCenter.x - 5, 5);
        hudCtx.lineTo(hudCenter.x + 5, 5);
        hudCtx.fill();

        // D. Vertical Airspeed Tape (Left side, scaled speed units)
        const spTapeX = 35;
        hudCtx.fillStyle = 'rgba(255,255,255,0.02)';
        hudCtx.fillRect(spTapeX, 45, 20, 130);
        hudCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        hudCtx.strokeRect(spTapeX, 45, 20, 130);

        hudCtx.save();
        hudCtx.beginPath();
        hudCtx.rect(spTapeX, 45, 20, 130);
        hudCtx.clip();

        hudCtx.fillStyle = 'rgba(255,255,255,0.6)';
        hudCtx.font = '8px monospace';
        hudCtx.textAlign = 'left';
        hudCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        
        // Velocity conversion
        const speedVal = scout.speed * (speedUnitSetting === 'm_s' ? 1 : (speedUnitSetting === 'knots' ? 1.94384 : 2.23694));
        const speedOffset = speedVal % 2;
        for (let i = -6; i <= 6; i++) {
            const markSp = Math.round(speedVal / 2) * 2 + i * 2;
            if (markSp < 0) continue;
            const markY = hudCenter.y - (i * 12) + speedOffset * 6;
            
            hudCtx.beginPath();
            hudCtx.moveTo(spTapeX, markY);
            hudCtx.lineTo(spTapeX + 5, markY);
            hudCtx.stroke();
            hudCtx.fillText(markSp, spTapeX + 8, markY + 3);
        }
        hudCtx.restore();

        // Target Airspeed Flag
        hudCtx.fillStyle = '#0f0f0f';
        hudCtx.strokeStyle = osdColor;
        hudCtx.strokeRect(spTapeX, hudCenter.y - 7, 22, 14);
        hudCtx.fillStyle = '#fff';
        hudCtx.font = '8px Orbitron';
        hudCtx.textAlign = 'center';
        hudCtx.fillText(speedVal.toFixed(1), spTapeX + 11, hudCenter.y + 3);
        
        hudCtx.font = '7px Orbitron';
        hudCtx.fillStyle = 'var(--text-muted)';
        const spLabel = speedUnitSetting === 'm_s' ? 'SPD m/s' : (speedUnitSetting === 'knots' ? 'SPD kt' : 'SPD mph');
        hudCtx.fillText(spLabel, spTapeX + 10, 185);

        // E. Vertical Altitude Tape (Right side, scaled distance units)
        const altTapeX = 265;
        hudCtx.fillStyle = 'rgba(255,255,255,0.02)';
        hudCtx.fillRect(altTapeX, 45, 20, 130);
        hudCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        hudCtx.strokeRect(altTapeX, 45, 20, 130);

        hudCtx.save();
        hudCtx.beginPath();
        hudCtx.rect(altTapeX, 45, 20, 130);
        hudCtx.clip();

        hudCtx.fillStyle = 'rgba(255,255,255,0.6)';
        hudCtx.font = '8px monospace';
        hudCtx.textAlign = 'right';
        hudCtx.strokeStyle = 'rgba(255,255,255,0.15)';
        
        // Altitude conversion
        const altVal = scout.altitude * (distUnitSetting === 'meters' ? 1 : 3.28084);
        const altOffset = altVal % 10;
        for (let i = -6; i <= 6; i++) {
            const markAlt = Math.round(altVal / 10) * 10 + i * 10;
            if (markAlt < 0) continue;
            const markY = hudCenter.y - (i * 10) + altOffset;
            
            hudCtx.beginPath();
            hudCtx.moveTo(altTapeX + 15, markY);
            hudCtx.lineTo(altTapeX + 20, markY);
            hudCtx.stroke();
            hudCtx.fillText(markAlt, altTapeX + 12, markY + 3);
        }
        hudCtx.restore();

        // Target Altitude Flag
        hudCtx.fillStyle = '#0f0f0f';
        hudCtx.strokeStyle = 'var(--gcs-cyan)';
        hudCtx.strokeRect(altTapeX - 2, hudCenter.y - 7, 22, 14);
        hudCtx.fillStyle = '#fff';
        hudCtx.font = '8px Orbitron';
        hudCtx.textAlign = 'center';
        hudCtx.fillText(Math.round(altVal), altTapeX + 9, hudCenter.y + 3);
        
        hudCtx.font = '7px Orbitron';
        hudCtx.fillStyle = 'var(--text-muted)';
        const altLabel = distUnitSetting === 'meters' ? 'ALT m' : 'ALT ft';
        hudCtx.fillText(altLabel, altTapeX + 10, 185);

        // F. Center Arm state HUD Warning Text Overlay
        hudCtx.font = '10px Orbitron';
        hudCtx.textAlign = 'center';
        if (isArmed) {
            hudCtx.fillStyle = 'var(--gcs-green)';
            hudCtx.fillText("ARMED: " + flightMode, hudCenter.x, hudCenter.y + 55);
        } else {
            // Flash disarmed warnings
            if (Math.floor(Date.now() / 400) % 2 === 0) {
                hudCtx.fillStyle = 'var(--gcs-red)';
                hudCtx.fillText("DISARMED", hudCenter.x, hudCenter.y + 55);
            }
        }
    }

    // -------------------------------------------------------------
    // 10. GCS Dashboard HUD Data Updater
    // -------------------------------------------------------------
    function updateHUD() {
        const scout = drones.scout;

        // Altitude setting conversions
        const distRatio = distUnitSetting === 'meters' ? 1 : 3.28084;
        const speedRatio = speedUnitSetting === 'm_s' ? 1 : (speedUnitSetting === 'knots' ? 1.94384 : 2.23694);

        // Quick Telemetry tab update
        quickAlt.innerText = (scout.altitude * distRatio).toFixed(2);
        quickSpeed.innerText = (scout.speed * speedRatio).toFixed(2);
        
        // Dist to Waypoint calculations
        let activeWps = customWaypoints.length > 0 ? customWaypoints : defaultWaypoints;
        let dist = 0.00;
        if (isArmed && flightMode === 'AUTO') {
            const wp = activeWps[scout.waypointIndex];
            dist = Math.hypot(scout.x - wp.x, scout.y - wp.y);
        } else if (isArmed && flightMode === 'GUIDED' && guidedTarget) {
            dist = Math.hypot(scout.x - guidedTarget.x, scout.y - guidedTarget.y);
        }
        quickDistWp.innerText = (dist * distRatio).toFixed(2);
        quickYaw.innerText = scout.heading.toFixed(1);
        
        // Vertical speed calculations
        let vsp = 0.00;
        if (isArmed && flightMode !== 'LAND' && scout.altitude < 120) vsp = 4.8;
        if (isArmed && flightMode === 'LAND' && scout.altitude > 0) vsp = -7.2;
        quickVspeed.innerText = (vsp * speedRatio).toFixed(2);
        quickBattery.innerText = `${Math.round(scout.battery)}%`;

        // Telemetry Stream Cards list updater
        d1Mode.innerText = isConnected ? (isArmed ? `${flightMode}` : 'DISARMED') : 'OFFLINE';
        d1Mode.className = `telemetry-mode mode-${isArmed ? (flightMode === 'LAND' ? 'returning' : (flightMode === 'STABILIZE' ? 'idle' : 'scanning')) : 'idle'}`;
        d1Gps.innerText = `X: ${Math.round(scout.x)}, Y: ${Math.round(scout.y)}`;
        d1Battery.style.width = `${Math.round(scout.battery)}%`;
        d1BatteryText.innerText = `${Math.round(scout.battery)}%`;
        
        // Voltage metrics
        const voltsD1 = (scout.battery / 100 * 2.6 + 10.0).toFixed(2);
        d1Voltage.innerText = isConnected ? `${voltsD1}V` : '0.00V';
        setBatteryColor(d1Battery, scout.battery);

        // Drone 2: Delivery A
        d2Mode.innerText = isConnected ? drones.deliveryA.mode : 'OFFLINE';
        d2Mode.className = `telemetry-mode mode-${drones.deliveryA.mode.toLowerCase()}`;
        d2Gps.innerText = `X: ${Math.round(drones.deliveryA.x)}, Y: ${Math.round(drones.deliveryA.y)}`;
        d2Battery.style.width = `${Math.round(drones.deliveryA.battery)}%`;
        d2BatteryText.innerText = `${Math.round(drones.deliveryA.battery)}%`;
        const voltsD2 = (drones.deliveryA.battery / 100 * 3.8 + 13.0).toFixed(2);
        d2Voltage.innerText = isConnected ? `${voltsD2}V` : '0.00V';
        setBatteryColor(d2Battery, drones.deliveryA.battery);

        // Drone 3: Delivery B
        d3Mode.innerText = isConnected ? drones.deliveryB.mode : 'OFFLINE';
        d3Mode.className = `telemetry-mode mode-${drones.deliveryB.mode.toLowerCase()}`;
        d3Gps.innerText = `X: ${Math.round(drones.deliveryB.x)}, Y: ${Math.round(drones.deliveryB.y)}`;
        d3Battery.style.width = `${Math.round(drones.deliveryB.battery)}%`;
        d3BatteryText.innerText = `${Math.round(drones.deliveryB.battery)}%`;
        const voltsD3 = (drones.deliveryB.battery / 100 * 3.8 + 13.0).toFixed(2);
        d3Voltage.innerText = isConnected ? `${voltsD3}V` : '0.00V';
        setBatteryColor(d3Battery, drones.deliveryB.battery);
    }

    function setBatteryColor(barElement, percentage) {
        barElement.classList.remove('bg-cyan', 'bg-blue', 'bg-purple', 'bg-orange', 'bg-red');
        
        if (percentage <= 25) {
            barElement.style.backgroundColor = 'var(--gcs-red)';
        } else if (percentage <= 50) {
            barElement.style.backgroundColor = 'var(--gcs-orange)';
        } else {
            if (barElement.id === 'd1-battery') barElement.style.backgroundColor = 'var(--gcs-cyan)';
            if (barElement.id === 'd2-battery') barElement.style.backgroundColor = 'var(--gcs-blue)';
            if (barElement.id === 'd3-battery') barElement.style.backgroundColor = 'var(--gcs-purple)';
        }
    }

    // -------------------------------------------------------------
    // 11. GCS Simulation Runner Loop
    // -------------------------------------------------------------
    function loop() {
        updateSimulation();
        render();
        renderGcsHud();
        updateHUD();
        requestAnimationFrame(loop);
    }

    // Kickoff loop
    loop();
});
