class SculptedSilence {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Add keyboard shortcuts for testing tools
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key.toLowerCase()) {
                case 's':
                    this.useIceScanner();
                    break;
                case 'm':
                    this.useIceMagnet();
                    break;
                case 'c':
                    this.useUnstableConverter();
                    break;
                case 'i':
                    this.useAdvancedIcepick();
                    break;
            }
        });
        
        // Initialize modules
        this.camera = new Camera(this.canvas);
        this.renderer = new Renderer(this.canvas);
        this.audioManager = new AudioManager();
        
        // Game state
        this.gameActive = false;
        this.currentLevel = 1;
        this.glassBroken = 0;
        this.voxels = [];
        this.completedSculptures = JSON.parse(localStorage.getItem('sculptureGallery') || '[]');
        
        // Tool system
        this.tools = {
            advancedIcepick: {
                usesPerLevel: 2,
                currentUses: 2,
                activeCharges: 0,
                maxCharges: 3
            },
            unstableConverter: {
                usesPerLevel: 2,
                currentUses: 2
            },
            iceScanner: {
                usesPerLevel: 2,
                currentUses: 2,
                activeArea: null // Will store the scanned area coordinates
            },
            iceMagnet: {
                usesPerLevel: 2,
                currentUses: 2
            }
        };
        
        // Initialize UI and start
        this.initUI();
        this.setupToolbar();
        this.generateSculpture();
        this.render();
    }
    
    initUI() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
        document.getElementById('galleryBtn').addEventListener('click', () => this.showGallery());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextLevel());
        
        // Gallery modal
        const modal = document.getElementById('galleryModal');
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    setupToolbar() {
        // Get all tool elements
        const icepickTool = document.getElementById('advancedIcepick');
        const converterTool = document.getElementById('unstableConverter');
        const scannerTool = document.getElementById('iceScanner');
        const magnetTool = document.getElementById('iceMagnet');
        const toolTooltip = document.getElementById('toolTooltip');
        
        // Add click event listeners
        icepickTool.addEventListener('click', () => this.useAdvancedIcepick());
        converterTool.addEventListener('click', () => this.useUnstableConverter());
        scannerTool.addEventListener('click', () => this.useIceScanner());
        magnetTool.addEventListener('click', () => this.useIceMagnet());
        
        // Tooltip functionality for Advanced Icepick
        icepickTool.addEventListener('mouseenter', () => {
            toolTooltip.textContent = 'Advanced Icepick - Chain breaking for next 3 taps';
            toolTooltip.classList.add('show');
        });
        
        icepickTool.addEventListener('mouseleave', () => {
            toolTooltip.classList.remove('show');
        });
        
        // Tooltip functionality for Unstable Converter
        converterTool.addEventListener('mouseenter', () => {
            toolTooltip.textContent = 'Unstable Converter - Convert random ice cube to explosive';
            toolTooltip.classList.add('show');
        });
        
        converterTool.addEventListener('mouseleave', () => {
            toolTooltip.classList.remove('show');
        });
        
        // Tooltip functionality for Ice Scanner
        scannerTool.addEventListener('mouseenter', () => {
            toolTooltip.textContent = 'Ice Scanner - Reveals cube contents in 3x3 area';
            toolTooltip.classList.add('show');
        });
        
        scannerTool.addEventListener('mouseleave', () => {
            toolTooltip.classList.remove('show');
        });
        
        // Tooltip functionality for Ice Magnet
        magnetTool.addEventListener('mouseenter', () => {
            toolTooltip.textContent = 'Ice Magnet - Pulls loose ice cubes toward target point';
            toolTooltip.classList.add('show');
        });
        
        magnetTool.addEventListener('mouseleave', () => {
            toolTooltip.classList.remove('show');
        });
        
        this.updateToolbarDisplay();
    }
    
    useAdvancedIcepick() {
        const tool = this.tools.advancedIcepick;
        
        if (!this.gameActive) {
            this.showFeedback('Start the game first!', 'warning');
            return;
        }
        
        if (tool.currentUses <= 0) {
            this.showFeedback('No Advanced Icepick uses remaining!', 'warning');
            return;
        }
        
        if (tool.activeCharges > 0) {
            this.showFeedback('Advanced Icepick already active!', 'warning');
            return;
        }
        
        // Activate the tool
        tool.currentUses--;
        tool.activeCharges = tool.maxCharges;
        
        this.updateToolbarDisplay();
        this.showFeedback(`🛠️ Advanced Icepick activated! Next ${tool.maxCharges} taps will have chain breaking effect!`, 'ice');
        
        // Show tooltip with current ability
        const toolTooltip = document.getElementById('toolTooltip');
        toolTooltip.textContent = `Chain breaking active for ${tool.activeCharges} more taps`;
        toolTooltip.classList.add('show');
        
        setTimeout(() => {
            toolTooltip.classList.remove('show');
        }, 3000);
    }
    
    useUnstableConverter() {
        const tool = this.tools.unstableConverter;
        
        if (!this.gameActive) {
            this.showFeedback('Start the game first!', 'warning');
            return;
        }
        
        if (tool.currentUses <= 0) {
            this.showFeedback('No Unstable Converter uses remaining!', 'warning');
            return;
        }
        
        // Find all visible ice cubes (not unstable ice)
        const iceCubes = this.voxels.filter(voxel =>
            voxel.visible && voxel.material === 'ice'
        );
        
        if (iceCubes.length === 0) {
            this.showFeedback('No ice cubes available to convert!', 'warning');
            return;
        }
        
        // Randomly select an ice cube to convert
        const randomIndex = Math.floor(Math.random() * iceCubes.length);
        const selectedCube = iceCubes[randomIndex];
        
        // Convert to unstable ice
        selectedCube.material = 'unstable_ice';
        selectedCube.revealed = true; // Unstable ice is always visible
        
        // Consume one use
        tool.currentUses--;
        
        this.updateToolbarDisplay();
        this.showFeedback(`💥 Ice cube converted to unstable explosive! ${tool.currentUses} uses remaining`, 'warning');
        
        // Show tooltip with current ability
        const toolTooltip = document.getElementById('toolTooltip');
        toolTooltip.textContent = `Explosive ice cube created! Handle with care!`;
        toolTooltip.classList.add('show');
        
        setTimeout(() => {
            toolTooltip.classList.remove('show');
        }, 3000);
    }
useIceScanner() {
        const tool = this.tools.iceScanner;
        
        if (!this.gameActive) {
            this.showFeedback('Start the game first!', 'warning');
            return;
        }
        
        if (tool.currentUses <= 0) {
            this.showFeedback('No Ice Scanner uses remaining!', 'warning');
            return;
        }
        
        // Activate scanner mode - next click will scan area
        tool.currentUses--;
        this.scannerActive = true;
        
        this.updateToolbarDisplay();
        this.showFeedback(`🔍 Ice Scanner activated! Click on sculpture to scan 3x3 area. ${tool.currentUses} uses remaining`, 'ice');
        
        // Change cursor to indicate scanner mode
        this.canvas.style.cursor = 'crosshair';
        
        // Show tooltip
        const toolTooltip = document.getElementById('toolTooltip');
        toolTooltip.textContent = 'Click anywhere on sculpture to scan area';
        toolTooltip.classList.add('show');
        
        setTimeout(() => {
            toolTooltip.classList.remove('show');
        }, 3000);
    }
    
    useIceMagnet() {
        const tool = this.tools.iceMagnet;
        
        if (!this.gameActive) {
            this.showFeedback('Start the game first!', 'warning');
            return;
        }
        
        if (tool.currentUses <= 0) {
            this.showFeedback('No Ice Magnet uses remaining!', 'warning');
            return;
        }
        
        // Activate magnet mode - next click will set target point
        tool.currentUses--;
        this.magnetActive = true;
        
        this.updateToolbarDisplay();
        this.showFeedback(`🧲 Ice Magnet activated! Click to set attraction point. ${tool.currentUses} uses remaining`, 'ice');
        
        // Change cursor to indicate magnet mode
        this.canvas.style.cursor = 'grab';
        
        // Show tooltip
        const toolTooltip = document.getElementById('toolTooltip');
        toolTooltip.textContent = 'Click to pull loose ice cubes toward target point';
        toolTooltip.classList.add('show');
        
        setTimeout(() => {
            toolTooltip.classList.remove('show');
        }, 3000);
    }
    
    updateToolbarDisplay() {
        // Advanced Icepick tool
        const icepickTool = this.tools.advancedIcepick;
        const icepickElement = document.getElementById('advancedIcepick');
        const icepickCounterElement = document.getElementById('icepickCounter');
        const icepickChargesElement = document.getElementById('icepickCharges');
        
        // Update counter (uses remaining)
        icepickCounterElement.textContent = icepickTool.currentUses;
        
        // Update charges (active charges)
        icepickChargesElement.textContent = icepickTool.activeCharges;
        icepickChargesElement.classList.toggle('empty', icepickTool.activeCharges === 0);
        
        // Update tool appearance
        icepickElement.classList.toggle('disabled', icepickTool.currentUses === 0);
        icepickElement.classList.toggle('active', icepickTool.activeCharges > 0);
        
        // Unstable Converter tool
        const converterTool = this.tools.unstableConverter;
        const converterElement = document.getElementById('unstableConverter');
        const converterCounterElement = document.getElementById('converterCounter');
        
        // Update counter (uses remaining)
        converterCounterElement.textContent = converterTool.currentUses;
        
        // Update tool appearance
        converterElement.classList.toggle('disabled', converterTool.currentUses === 0);
        
        // Ice Scanner tool
        const scannerTool = this.tools.iceScanner;
        const scannerElement = document.getElementById('iceScanner');
        const scannerCounterElement = document.getElementById('scannerCounter');
        
        // Update counter (uses remaining)
        scannerCounterElement.textContent = scannerTool.currentUses;
        
        // Update tool appearance
        scannerElement.classList.toggle('disabled', scannerTool.currentUses === 0);
        scannerElement.classList.toggle('active', this.scannerActive);
        
        // Ice Magnet tool
        const magnetTool = this.tools.iceMagnet;
        const magnetElement = document.getElementById('iceMagnet');
        const magnetCounterElement = document.getElementById('magnetCounter');
        
        // Update counter (uses remaining)
        magnetCounterElement.textContent = magnetTool.currentUses;
        
        // Update tool appearance
        magnetElement.classList.toggle('disabled', magnetTool.currentUses === 0);
        magnetElement.classList.toggle('active', this.magnetActive);
    }
    
    generateSculpture() {
        this.voxels = SculptureGenerator.generateSculpture(this.currentLevel);
        this.updateStats();
        this.showSculptureHint();
        // Initial revelation of isolated glass cubes
        this.revealIsolatedGlass();
    }
    
    showSculptureHint() {
        const sculptureName = SculptureGenerator.getSculptureName(this.currentLevel);
        const hintElement = document.getElementById('sculptureHint');
        if (hintElement) {
            hintElement.textContent = `Level ${this.currentLevel}: ${sculptureName}`;
        }
    }
    
    revealIsolatedGlass() {
        // Check each glass cube to see if it has any ice neighbors
        let newlyRevealed = 0;
        this.voxels.forEach(voxel => {
            if (voxel.material === 'glass' && !voxel.revealed && voxel.visible) {
                const hasIceNeighbor = this.hasAdjacentIce(voxel);
                if (!hasIceNeighbor) {
                    voxel.revealed = true;
                    newlyRevealed++;
                }
            }
        });
        
        if (newlyRevealed > 0) {
            this.showFeedback(`${newlyRevealed} isolated glass cube${newlyRevealed > 1 ? 's' : ''} revealed!`, 'glass');
        }
    }
    
    hasAdjacentIce(targetVoxel) {
        // Check all 6 adjacent positions (faces only, not edges/corners)
        const adjacentPositions = [
            { x: targetVoxel.x + 1, y: targetVoxel.y, z: targetVoxel.z },
            { x: targetVoxel.x - 1, y: targetVoxel.y, z: targetVoxel.z },
            { x: targetVoxel.x, y: targetVoxel.y + 1, z: targetVoxel.z },
            { x: targetVoxel.x, y: targetVoxel.y - 1, z: targetVoxel.z },
            { x: targetVoxel.x, y: targetVoxel.y, z: targetVoxel.z + 1 },
            { x: targetVoxel.x, y: targetVoxel.y, z: targetVoxel.z - 1 }
        ];
        
        return adjacentPositions.some(pos => {
            return this.voxels.some(voxel =>
                voxel.visible &&
                voxel.x === pos.x &&
                voxel.y === pos.y &&
                voxel.z === pos.z &&
                (voxel.material === 'ice' || voxel.material === 'unstable_ice')
            );
        });
    }
    
    triggerChainTapping(tappedVoxel) {
        // Get all adjacent voxels (6 faces)
        const adjacentVoxels = this.getAdjacentVoxels(tappedVoxel);
        let chainTappedCount = 0;
        
        adjacentVoxels.forEach(voxel => {
            // Chain tapping only affects ice cubes, not glass
            if (voxel.visible && (voxel.material === 'ice' || voxel.material === 'unstable_ice')) {
                // Tap the adjacent voxel once (but don't trigger further chain tapping)
                voxel.taps++;
                voxel.lastTapped = Date.now();
                
                // First tap reveals the material
                if (voxel.taps === 1) {
                    voxel.revealed = true;
                }
                
                // Set crack level based on material-specific rules
                if (voxel.material === 'ice') {
                    voxel.crackLevel = voxel.taps;
                } else if (voxel.material === 'unstable_ice') {
                    voxel.crackLevel = voxel.taps;
                }
                
                // Check if the adjacent voxel should break
                let breakPoint;
                if (voxel.material === 'ice') {
                    breakPoint = voxel.weakened ? 1 : 2;
                } else if (voxel.material === 'unstable_ice') {
                    breakPoint = 2;
                }
                
                if (voxel.taps >= breakPoint) {
                    this.breakVoxel(voxel);
                }
                
                chainTappedCount++;
            }
        });
        
        if (chainTappedCount > 0) {
            this.showFeedback(`${chainTappedCount} adjacent cube${chainTappedCount > 1 ? 's' : ''} chain tapped!`, 'ice');
        }
    }
    
    render() {
        this.renderer.clear();
        
        // Sort voxels by depth for proper rendering
        const sortedVoxels = this.voxels
            .filter(voxel => voxel.visible)
            .map(voxel => ({
                ...voxel,
                projected: this.camera.project3D(voxel.x, voxel.y, voxel.z)
            }))
            .sort((a, b) => b.projected.z - a.projected.z);
        
        // Render voxels as 3D cubes
        sortedVoxels.forEach(voxel => {
            this.renderer.renderCube(voxel, this.camera);
        });
        
        requestAnimationFrame(() => this.render());
    }
    
    handleClick(event) {
        if (!this.gameActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Check if scanner is active
        if (this.scannerActive) {
            this.performScan(clickX, clickY);
            return;
        }
        
        // Check if magnet is active
        if (this.magnetActive) {
            this.performMagnetPull(clickX, clickY);
            return;
        }
        
        // Find clicked voxel
        let clickedVoxel = null;
        let minDistance = Infinity;
        
        this.voxels.forEach(voxel => {
            if (!voxel.visible) return;
            
            const pos = this.camera.project3D(voxel.x, voxel.y, voxel.z);
            const size = 30 * pos.scale;
            const distance = Math.sqrt(
                Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2)
            );
            
            if (distance < size/2 && pos.z < minDistance) {
                minDistance = pos.z;
                clickedVoxel = voxel;
            }
        });
        
        if (clickedVoxel) {
            this.tapVoxel(clickedVoxel);
        }
    }
    
performScan(clickX, clickY) {
        // Find the center voxel for the scan
        let centerVoxel = null;
        let minDistance = Infinity;
        
        this.voxels.forEach(voxel => {
            if (!voxel.visible) return;
            
            const pos = this.camera.project3D(voxel.x, voxel.y, voxel.z);
            const size = 30 * pos.scale;
            const distance = Math.sqrt(
                Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2)
            );
            
            if (distance < size/2 && pos.z < minDistance) {
                minDistance = pos.z;
                centerVoxel = voxel;
            }
        });
        
        if (!centerVoxel) {
            this.showFeedback('No valid scan target found!', 'warning');
            this.scannerActive = false;
            this.canvas.style.cursor = 'default';
            return;
        }
        
        // Scan 3x3x3 area around center voxel
        const scanResults = { ice: 0, glass: 0, unstable: 0 };
        const scannedVoxels = [];
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const scanX = centerVoxel.x + dx;
                    const scanY = centerVoxel.y + dy;
                    const scanZ = centerVoxel.z + dz;
                    
                    const voxel = this.voxels.find(v => 
                        v.visible && v.x === scanX && v.y === scanY && v.z === scanZ
                    );
                    
                    if (voxel) {
                        scannedVoxels.push(voxel);
                        voxel.scanned = true;
                        voxel.scanTime = Date.now();
                        
                        // Scanner reveals the material without breaking the cube
                        if (!voxel.revealed) {
                            voxel.revealed = true;
                        }
                        
                        if (voxel.material === 'ice') scanResults.ice++;
                        else if (voxel.material === 'glass') scanResults.glass++;
                        else if (voxel.material === 'unstable_ice') scanResults.unstable++;
                    }
                }
            }
        }
        
        // Clear scan effect after 3 seconds
        setTimeout(() => {
            scannedVoxels.forEach(voxel => {
                voxel.scanned = false;
            });
        }, 3000);
        
        // Show scan results
        let resultText = `🔍 Scan complete: `;
        if (scanResults.ice > 0) resultText += `${scanResults.ice} ice `;
        if (scanResults.glass > 0) resultText += `${scanResults.glass} glass `;
        if (scanResults.unstable > 0) resultText += `${scanResults.unstable} unstable `;
        
        this.showFeedback(resultText, 'ice');
        
        // Deactivate scanner
        this.scannerActive = false;
        this.canvas.style.cursor = 'default';
    }
    
    performMagnetPull(clickX, clickY) {
        // Find target point in 3D space
        let targetVoxel = null;
        let minDistance = Infinity;
        
        this.voxels.forEach(voxel => {
            if (!voxel.visible) return;
            
            const pos = this.camera.project3D(voxel.x, voxel.y, voxel.z);
            const size = 30 * pos.scale;
            const distance = Math.sqrt(
                Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2)
            );
            
            if (distance < size/2 && pos.z < minDistance) {
                minDistance = pos.z;
                targetVoxel = voxel;
            }
        });
        
        if (!targetVoxel) {
            this.showFeedback('No valid magnet target found!', 'warning');
            this.magnetActive = false;
            this.canvas.style.cursor = 'default';
            return;
        }
        
        // Find all loose ice cubes (ice cubes with no support below)
        const looseIceCubes = this.voxels.filter(voxel => {
            if (!voxel.visible || voxel.material !== 'ice') return false;
            
            // Check if there's support below this cube
            const hasSupport = this.voxels.some(supportVoxel =>
                supportVoxel.visible &&
                supportVoxel.x === voxel.x &&
                supportVoxel.y === voxel.y - 1 &&
                supportVoxel.z === voxel.z
            );
            
            return !hasSupport && voxel.y > 0; // Not on ground level and no support
        });
        
        if (looseIceCubes.length === 0) {
            this.showFeedback('No loose ice cubes found to attract!', 'warning');
            this.magnetActive = false;
            this.canvas.style.cursor = 'default';
            return;
        }
        
        // Move loose ice cubes toward target point
        let movedCubes = 0;
        looseIceCubes.forEach(cube => {
            const dx = targetVoxel.x - cube.x;
            const dy = targetVoxel.y - cube.y;
            const dz = targetVoxel.z - cube.z;
            
            // Move one step toward target (simplified movement)
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
                cube.x += Math.sign(dx);
            } else if (Math.abs(dy) > Math.abs(dz)) {
                cube.y += Math.sign(dy);
            } else if (dz !== 0) {
                cube.z += Math.sign(dz);
            }
            
            // Add magnetic effect
            cube.magnetized = true;
            cube.magnetTime = Date.now();
            movedCubes++;
        });
        
        // Clear magnetic effect after 2 seconds
        setTimeout(() => {
            looseIceCubes.forEach(cube => {
                cube.magnetized = false;
            });
        }, 2000);
        
        this.showFeedback(`🧲 Magnet pulled ${movedCubes} loose ice cube${movedCubes > 1 ? 's' : ''} toward target!`, 'ice');
        
        // Deactivate magnet
        this.magnetActive = false;
        this.canvas.style.cursor = 'default';
    }
    tapVoxel(voxel) {
        voxel.taps++;
        voxel.lastTapped = Date.now(); // For shine effects
        
        // First tap reveals the material (3D Minesweeper mechanic)
        if (voxel.taps === 1) {
            voxel.revealed = true;
        }
        
        // Set crack level based on material-specific rules
        if (voxel.material === 'ice') {
            voxel.crackLevel = voxel.taps; // Ice cracks on 1st tap
        } else if (voxel.material === 'unstable_ice') {
            voxel.crackLevel = voxel.taps; // Unstable ice cracks on 1st tap
        } else {
            // Glass only cracks starting from 2nd tap
            voxel.crackLevel = Math.max(0, voxel.taps - 1);
        }
        
        // Play sound and show feedback based on material
        if (voxel.material === 'ice') {
            const breakPoint = voxel.weakened ? 1 : 2;
            this.audioManager.playIceSound(voxel.taps);
            if (voxel.taps === 1) {
                this.showFeedback(`Ice cube cracked! (${voxel.taps}/${breakPoint} taps)${voxel.weakened ? ' - Weakened!' : ''}`, 'ice');
            } else {
                this.showFeedback(`Ice cube (${voxel.taps}/${breakPoint} taps)${voxel.weakened ? ' - Weakened!' : ''}`, 'ice');
            }
        } else if (voxel.material === 'unstable_ice') {
            this.audioManager.playUnstableIceSound(voxel.taps);
            if (voxel.taps === 1) {
                this.showFeedback(`Unstable Ice cracked! (${voxel.taps}/2 taps) - Will explode!`, 'warning');
            } else {
                this.showFeedback(`Unstable Ice (${voxel.taps}/2 taps) - Will explode!`, 'warning');
            }
        } else {
            this.audioManager.playGlassSound(voxel.taps);
            if (voxel.taps === 1) {
                this.showFeedback(`Glass cube identified! (${voxel.taps}/3 taps)`, 'glass');
            } else if (voxel.taps === 2) {
                this.showFeedback(`Glass cube cracked! (${voxel.taps}/3 taps)`, 'glass');
            } else {
                this.showFeedback(`Glass cube deeply cracked! (${voxel.taps}/3 taps)`, 'glass');
            }
        }
        
        // Advanced Icepick: Consume charge on ANY tap when active
        if (this.tools.advancedIcepick.activeCharges > 0) {
            // Consume one charge regardless of cube type
            this.tools.advancedIcepick.activeCharges--;
            this.updateToolbarDisplay();
            
            // Chain tapping only works on ice cubes
            if (voxel.material === 'ice' || voxel.material === 'unstable_ice') {
                this.triggerChainTapping(voxel);
                
                // Show chain tapping feedback
                if (this.tools.advancedIcepick.activeCharges > 0) {
                    this.showFeedback(`🛠️ Chain tapping! ${this.tools.advancedIcepick.activeCharges} charges remaining`, 'ice');
                } else {
                    this.showFeedback(`🛠️ Advanced Icepick depleted! Chain tapping used on ice`, 'warning');
                }
            } else {
                // Charge wasted on non-ice cube
                if (this.tools.advancedIcepick.activeCharges > 0) {
                    this.showFeedback(`🛠️ Charge wasted on glass! ${this.tools.advancedIcepick.activeCharges} charges remaining`, 'warning');
                } else {
                    this.showFeedback(`🛠️ Advanced Icepick depleted! Charge wasted on glass`, 'warning');
                }
            }
        }
        
        // Check if voxel should break
        let breakPoint;
        if (voxel.material === 'ice') {
            breakPoint = voxel.weakened ? 1 : 2;
        } else if (voxel.material === 'unstable_ice') {
            breakPoint = 2;
        } else {
            breakPoint = 3; // Glass breaks on 3rd tap
        }
        
        if (voxel.taps >= breakPoint) {
            this.breakVoxel(voxel);
        } else {
            // After each tap, check for newly isolated glass cubes
            this.revealIsolatedGlass();
        }
    }
    
    breakVoxel(voxel) {
        voxel.visible = false;
        
        if (voxel.material === 'glass') {
            this.glassBroken++;
            this.showFeedback('Glass broken! Score reduced!', 'warning');
            this.audioManager.playBreakingSound();
        } else if (voxel.material === 'unstable_ice') {
            this.showFeedback('🔥 Unstable Ice exploded! Massive chain reaction incoming! 🔥', 'warning');
            this.audioManager.playMassiveExplosionSound();
            this.triggerUnstableExplosion(voxel);
        } else {
            this.showFeedback('Ice cleared!', 'ice');
            this.triggerChainBreaking(voxel);
        }
        
        this.updateStats();
        this.checkCompletion();
    }
    
    triggerChainBreaking(brokenVoxel) {
        const adjacentVoxels = this.getAdjacentVoxels(brokenVoxel);
        let weakenedCount = 0;
        
        adjacentVoxels.forEach(voxel => {
            if (voxel.visible && (voxel.material === 'ice' || voxel.material === 'unstable_ice') && !voxel.weakened) {
                voxel.weakened = true;
                weakenedCount++;
            }
        });
        
        if (weakenedCount > 0) {
            this.audioManager.playChainBreakSound();
            this.showFeedback(`${weakenedCount} ice cubes weakened by chain breaking!`, 'ice');
        }
    }
    
    triggerUnstableExplosion(explodedVoxel) {
        const explosionRadius = 3.5; // Increased radius for more dramatic effect
        const maxDestroyed = 20; // Much higher destruction limit
        let destroyedCount = 0;
        let chainExplosions = [];
        
        // Get all voxels within explosion radius
        const voxelsInRange = this.voxels.filter(voxel => {
            if (!voxel.visible || voxel === explodedVoxel) return false;
            
            const distance = Math.sqrt(
                Math.pow(voxel.x - explodedVoxel.x, 2) +
                Math.pow(voxel.y - explodedVoxel.y, 2) +
                Math.pow(voxel.z - explodedVoxel.z, 2)
            );
            
            return distance <= explosionRadius;
        });
        
        // Sort by distance (closest first) and destroy up to maxDestroyed
        voxelsInRange
            .sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a.x - explodedVoxel.x, 2) + Math.pow(a.y - explodedVoxel.y, 2) + Math.pow(a.z - explodedVoxel.z, 2));
                const distB = Math.sqrt(Math.pow(b.x - explodedVoxel.x, 2) + Math.pow(b.y - explodedVoxel.y, 2) + Math.pow(b.z - explodedVoxel.z, 2));
                return distA - distB;
            })
            .slice(0, maxDestroyed)
            .forEach((voxel, index) => {
                // Only destroy ice and unstable ice - glass cubes are completely protected from explosions
                if (voxel.material === 'ice' || voxel.material === 'unstable_ice') {
                    // Stagger destruction for dramatic effect
                    setTimeout(() => {
                        voxel.visible = false;
                        destroyedCount++;
                        
                        // Trigger chain breaking for each destroyed ice cube
                        if (voxel.material === 'ice') {
                            this.triggerChainBreaking(voxel);
                        }
                    }, index * 50); // 50ms delay between each destruction
                    
                    // Chain more unstable explosions with longer delays for dramatic effect
                    if (voxel.material === 'unstable_ice') {
                        chainExplosions.push(voxel);
                    }
                }
                // Glass cubes are completely immune to explosions to preserve puzzle integrity
            });
        
        // Trigger chain explosions with dramatic delays
        chainExplosions.forEach((unstableVoxel, index) => {
            setTimeout(() => {
                if (unstableVoxel.visible) { // Only explode if still visible
                    this.triggerUnstableExplosion(unstableVoxel);
                }
            }, 300 + index * 200); // Longer delays for more dramatic chain reactions
        });
        
        // Enhanced feedback messages
        if (destroyedCount > 0) {
            if (destroyedCount >= 15) {
                this.showFeedback(`🔥 MASSIVE EXPLOSION! ${destroyedCount} cubes obliterated! 🔥`, 'warning');
            } else if (destroyedCount >= 10) {
                this.showFeedback(`💥 HUGE EXPLOSION! ${destroyedCount} cubes destroyed! 💥`, 'warning');
            } else {
                this.showFeedback(`💥 Explosion destroyed ${destroyedCount} cubes!`, 'warning');
            }
        }
        
        // Add screen shake effect simulation through feedback
        if (destroyedCount >= 10) {
            setTimeout(() => {
                this.showFeedback('🌪️ Devastating chain reaction continues...', 'warning');
            }, 500);
        }
    }
    
    getAdjacentVoxels(centerVoxel) {
        const adjacent = [];
        const directions = [
            [-1, 0, 0], [1, 0, 0],  // Left, Right
            [0, -1, 0], [0, 1, 0],  // Down, Up
            [0, 0, -1], [0, 0, 1]   // Back, Front
        ];
        
        directions.forEach(([dx, dy, dz]) => {
            const adjacentVoxel = this.voxels.find(voxel =>
                voxel.x === centerVoxel.x + dx &&
                voxel.y === centerVoxel.y + dy &&
                voxel.z === centerVoxel.z + dz
            );
            
            if (adjacentVoxel) {
                adjacent.push(adjacentVoxel);
            }
        });
        
        return adjacent;
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback-message ${type}`;
        
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback-message';
        }, 2000);
    }
    
    updateStats() {
        document.getElementById('glassBroken').textContent = this.glassBroken;
        
        const iceRemaining = this.voxels.filter(v => v.visible && v.material === 'ice').length;
        document.getElementById('iceRemaining').textContent = iceRemaining;
        
        // Update stars
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (this.glassBroken > index) {
                star.classList.add('lost');
            } else {
                star.classList.remove('lost');
            }
        });
    }
    
    checkCompletion() {
        const iceRemaining = this.voxels.filter(v => v.visible && v.material === 'ice').length;
        
        if (iceRemaining === 0) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.gameActive = false;
        
        // Stop background music gracefully
        this.audioManager.stopBackgroundMusic();
        
        // Reveal all glass cubes to show the complete sculpture
        this.voxels.forEach(voxel => {
            if (voxel.material === 'glass' && voxel.visible) {
                voxel.revealed = true;
            }
        });
        // Calculate stars based on glass damage (broken OR cracked)
        const glassDamage = this.calculateGlassDamage();
        const stars = Math.max(0, 3 - glassDamage);
        const completion = document.getElementById('completion');
        const finalStars = document.getElementById('finalStars');
        const completionText = document.getElementById('completionText');
        
        // Show completion message
        completion.classList.remove('hidden');
        
        // Display stars
        finalStars.innerHTML = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        
        if (stars === 3) {
            completionText.textContent = 'Perfect! Sculpture saved to gallery.';
            this.saveSculpture(stars);
        } else {
            const crackedGlass = glassDamage - this.glassBroken;
            let message = '';
            if (this.glassBroken > 0 && crackedGlass > 0) {
                message = `${this.glassBroken} glass cube(s) broken, ${crackedGlass} cracked. Perfect score requires no glass damage!`;
            } else if (this.glassBroken > 0) {
                message = `${this.glassBroken} glass cube(s) broken. Perfect score requires no glass damage!`;
            } else if (crackedGlass > 0) {
                message = `${crackedGlass} glass cube(s) cracked. Perfect score requires no glass damage!`;
            }
            completionText.textContent = message;
        }
        
        this.audioManager.playVictorySound();
    }
calculateGlassDamage() {
        let glassDamage = 0;
        
        this.voxels.forEach(voxel => {
            if (voxel.material === 'glass' && voxel.visible) {
                // Count broken glass cubes
                if (!voxel.visible || voxel.taps >= 3) {
                    glassDamage++;
                }
                // Count cracked glass cubes (any taps > 0 but not broken)
                else if (voxel.taps > 0) {
                    glassDamage++;
                }
            }
        });
        
        return glassDamage;
    }
    
    saveSculpture(stars) {
        const sculptureData = {
            level: this.currentLevel,
            stars: stars,
            timestamp: Date.now(),
            voxels: this.voxels.filter(v => v.material === 'glass').map(v => ({
                x: v.x, y: v.y, z: v.z
            }))
        };
        
        // Remove existing sculpture of same level
        this.completedSculptures = this.completedSculptures.filter(s => s.level !== this.currentLevel);
        this.completedSculptures.push(sculptureData);
        
        localStorage.setItem('sculptureGallery', JSON.stringify(this.completedSculptures));
    }
    
    startGame() {
        this.gameActive = true;
        this.glassBroken = 0;
        document.getElementById('completion').classList.add('hidden');
        this.updateStats();
        
        // Reset tools for new game
        this.resetTools();
        
        // Start soothing background music
        this.audioManager.startBackgroundMusic();
        
        // Add keyboard shortcut for testing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'T' || e.key === 't') {
                // Test mode: instantly clear all ice cubes
                this.voxels.forEach(voxel => {
                    if (voxel.material === 'ice' && voxel.visible) {
                        voxel.visible = false;
                    }
                });
                this.updateStats();
                this.checkCompletion();
                this.showFeedback('🧪 Test Mode: All ice cleared!', 'ice');
            }
        });
        
        // Show game start feedback
        const sculptureName = SculptureGenerator.getSculptureName(this.currentLevel);
        this.showFeedback(`🎯 Game Started! Reveal the ${sculptureName} sculpture by carefully removing ice cubes. Listen to the sounds to identify materials! (Press T for test mode)`, 'ice');
    }
    
    resetTools() {
        // Reset Advanced Icepick tool
        this.tools.advancedIcepick.currentUses = this.tools.advancedIcepick.usesPerLevel;
        this.tools.advancedIcepick.activeCharges = 0;
        
        // Reset Unstable Converter tool
        this.tools.unstableConverter.currentUses = this.tools.unstableConverter.usesPerLevel;
        
        // Reset Ice Scanner tool
        this.tools.iceScanner.currentUses = this.tools.iceScanner.usesPerLevel;
        this.tools.iceScanner.activeArea = null;
        this.scannerActive = false;
        
        // Reset Ice Magnet tool
        this.tools.iceMagnet.currentUses = this.tools.iceMagnet.usesPerLevel;
        this.magnetActive = false;
        
        // Reset cursor
        if (this.canvas) {
            this.canvas.style.cursor = 'default';
        }
        
        this.updateToolbarDisplay();
    }
    
    resetLevel() {
        this.gameActive = false;
        this.glassBroken = 0;
        
        // Stop background music when resetting
        this.audioManager.stopBackgroundMusic();
        
        // Reset tools when resetting level
        this.resetTools();
        
        document.getElementById('completion').classList.add('hidden');
        this.generateSculpture();
    }
    
    nextLevel() {
        this.currentLevel++;
        this.resetLevel();
    }
    
    showGallery() {
        const modal = document.getElementById('galleryModal');
        const grid = document.getElementById('galleryGrid');
        
        grid.innerHTML = '';
        
        if (this.completedSculptures.length === 0) {
            grid.innerHTML = '<p>No perfect sculptures yet. Complete levels without breaking glass!</p>';
        } else {
            this.completedSculptures.forEach(sculpture => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const canvas = document.createElement('canvas');
                canvas.width = 150;
                canvas.height = 100;
                
                const ctx = canvas.getContext('2d');
                const miniRenderer = new Renderer(canvas);
                miniRenderer.renderMiniSculpture(sculpture.voxels, canvas.width, canvas.height, this.camera);
                
                item.appendChild(canvas);
                item.innerHTML += `
                    <h4>Level ${sculpture.level}</h4>
                    <div class="stars">${'★'.repeat(sculpture.stars)}</div>
                `;
                
                grid.appendChild(item);
            });
        }
        
        modal.classList.remove('hidden');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SculptedSilence();
});