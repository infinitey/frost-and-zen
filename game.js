class SculptedSilence {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
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
        
        // Initialize UI and start
        this.initUI();
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
        
        // Chain tapping: When ice is tapped, tap all adjacent cubes once
        if (voxel.material === 'ice' || voxel.material === 'unstable_ice') {
            this.triggerChainTapping(voxel);
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
        
        const stars = Math.max(0, 3 - this.glassBroken);
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
            completionText.textContent = `${this.glassBroken} glass voxel(s) broken. Try again for a perfect score!`;
        }
        
        this.audioManager.playVictorySound();
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
        
        // Show game start feedback
        const sculptureName = SculptureGenerator.getSculptureName(this.currentLevel);
        this.showFeedback(`🎯 Game Started! Reveal the ${sculptureName} sculpture by carefully removing ice cubes. Listen to the sounds to identify materials!`, 'ice');
    }
    
    resetLevel() {
        this.gameActive = false;
        this.glassBroken = 0;
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