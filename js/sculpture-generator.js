class SculptureGenerator {
    static generateSpiral(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const maxRadius = size / 3;
        
        for (let y = 0; y < size; y++) {
            const heightRatio = y / (size - 1);
            const radius = maxRadius * (1 - heightRatio * 0.5);
            const angle = heightRatio * Math.PI * 4; // 4 full rotations
            
            // Create spiral path
            for (let t = 0; t < Math.PI * 2; t += 0.3) {
                const spiralAngle = angle + t;
                const x = Math.round(center + Math.cos(spiralAngle) * radius);
                const z = Math.round(center + Math.sin(spiralAngle) * radius);
                
                if (x >= 0 && x < size && z >= 0 && z < size) {
                    pattern[x][y][z] = true;
                    // Add thickness
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dz = -1; dz <= 1; dz++) {
                            const nx = x + dx, nz = z + dz;
                            if (nx >= 0 && nx < size && nz >= 0 && nz < size) {
                                pattern[nx][y][nz] = true;
                            }
                        }
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateHeart(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    // Heart equation in 3D
                    const nx = (x - center) / (size / 4);
                    const ny = (y - center) / (size / 4);
                    const nz = (z - center) / (size / 4);
                    
                    const heartEq = Math.pow(nx * nx + ny * ny + nz * nz - 1, 3) -
                                   nx * nx * nz * nz * nz - 0.1 * ny * ny * nz * nz * nz;
                    
                    if (heartEq <= 0 && Math.abs(nx) < 1.5 && Math.abs(ny) < 1.5 && Math.abs(nz) < 1.5) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateDonut(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const majorRadius = size / 3;
        const minorRadius = size / 6;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    
                    // Torus equation
                    const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
                    const torusDistance = Math.sqrt(
                        Math.pow(distanceFromCenter - majorRadius, 2) + dy * dy
                    );
                    
                    if (torusDistance <= minorRadius) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateDiamond(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = Math.abs(x - center);
                    const dy = Math.abs(y - center);
                    const dz = Math.abs(z - center);
                    
                    // Diamond shape (octahedron)
                    if (dx + dy + dz <= size / 2.5) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateStarfish(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const arms = 5;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dz = z - center;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    const angle = Math.atan2(dz, dx);
                    
                    // Create star pattern
                    const starRadius = (size / 4) * (1 + 0.5 * Math.cos(arms * angle));
                    const heightFactor = 1 - Math.abs(y - center) / (size / 2);
                    
                    if (distance <= starRadius * heightFactor && heightFactor > 0.2) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateFlower(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const petals = 6;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    const angle = Math.atan2(dz, dx);
                    
                    // Flower petals
                    const petalRadius = (size / 4) * (1 + 0.7 * Math.cos(petals * angle));
                    const heightCurve = Math.exp(-Math.pow(dy / (size / 4), 2));
                    
                    if (distance <= petalRadius && heightCurve > 0.3) {
                        pattern[x][y][z] = true;
                    }
                    
                    // Flower center
                    if (distance <= size / 8 && Math.abs(dy) <= size / 6) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateSculpture(level) {
        // Progressive difficulty: start with smaller grids and simpler shapes
        let size, iceChance, unstableChance;
        
        if (level <= 2) {
            size = 4; // Very small for beginners
            iceChance = 0.15; // Very few ice cubes
            unstableChance = 0.05;
        } else if (level <= 4) {
            size = 5; // Small
            iceChance = 0.2;
            unstableChance = 0.08;
        } else if (level <= 6) {
            size = 6; // Medium
            iceChance = 0.25;
            unstableChance = 0.1;
        } else {
            size = 7; // Large for advanced players
            iceChance = 0.3;
            unstableChance = 0.12;
        }
        
        const center = Math.floor(size / 2);
        
        // Define sculpture patterns with progressive complexity
        const sculptures = [
            // Level 1-2: Very simple shapes
            this.generateSimpleCube(size),
            this.generateSimplePyramid(size),
            // Level 3-4: Basic shapes
            this.generateDiamond(size),
            this.generateSimpleHeart(size),
            // Level 5-6: Intermediate shapes
            this.generateStarfish(size),
            this.generateDonut(size),
            // Level 7+: Complex shapes
            this.generateSpiral(size),
            this.generateFlower(size)
        ];
        
        const sculpturePattern = sculptures[(level - 1) % sculptures.length];
        const voxels = [];
        
        // First pass: Add all glass cubes
        const glassCubes = [];
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const isGlass = sculpturePattern[x][y][z];
                    if (isGlass) {
                        const glassVoxel = {
                            x: x - center,
                            y: y - center,
                            z: z - center,
                            material: 'glass',
                            taps: 0,
                            visible: true,
                            crackLevel: 0,
                            revealed: false,
                            lastTapped: 0,
                            gridX: x,
                            gridY: y,
                            gridZ: z,
                            weakened: false
                        };
                        voxels.push(glassVoxel);
                        glassCubes.push(glassVoxel);
                    }
                }
            }
        }
        
        // Calculate target ice count: 1 to 1.25 times the glass count
        const glassCount = glassCubes.length;
        const targetIceCount = Math.round(glassCount * (1 + Math.random() * 0.25));
        
        // Second pass: Add ice cubes strategically
        const availablePositions = [];
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const isGlass = sculpturePattern[x][y][z];
                    if (!isGlass) {
                        availablePositions.push({ x, y, z });
                    }
                }
            }
        }
        
        // Shuffle available positions and select the target number
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }
        
        const selectedPositions = availablePositions.slice(0, targetIceCount);
        
        selectedPositions.forEach(pos => {
            let material = 'ice';
            
            // Add unstable ice cubes
            if (Math.random() < unstableChance) {
                material = 'unstable_ice';
            }
            
            voxels.push({
                x: pos.x - center,
                y: pos.y - center,
                z: pos.z - center,
                material: material,
                taps: 0,
                visible: true,
                crackLevel: 0,
                revealed: material === 'unstable_ice', // Unstable ice is revealed from start
                lastTapped: 0, // For shine effects
                gridX: pos.x,
                gridY: pos.y,
                gridZ: pos.z,
                weakened: false
            });
        });
        
        // Reveal isolated glass cubes (3D Minesweeper mechanic)
        this.revealIsolatedGlass(voxels);
        
        return voxels;
    }
    
    static revealIsolatedGlass(voxels) {
        // Check each glass cube to see if it has any ice neighbors
        voxels.forEach(voxel => {
            if (voxel.material === 'glass' && !voxel.revealed) {
                const hasIceNeighbor = this.hasAdjacentIce(voxel, voxels);
                if (!hasIceNeighbor) {
                    voxel.revealed = true; // Reveal isolated glass cubes
                }
            }
        });
    }
    
    static hasAdjacentIce(targetVoxel, allVoxels) {
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
            return allVoxels.some(voxel =>
                voxel.visible &&
                voxel.x === pos.x &&
                voxel.y === pos.y &&
                voxel.z === pos.z &&
                (voxel.material === 'ice' || voxel.material === 'unstable_ice')
            );
        });
    }
    
    static getSculptureName(level) {
        const names = [
            "Simple Cube",
            "Basic Pyramid",
            "Crystal Diamond",
            "Gentle Heart",
            "Ocean Starfish",
            "Magic Donut",
            "Mystic Spiral",
            "Blooming Flower"
        ];
        return names[(level - 1) % names.length];
    }
    
    static generateSimpleCube(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        const radius = Math.max(1, Math.floor(size / 3));
        
        for (let x = center - radius; x <= center + radius; x++) {
            for (let y = center - radius; y <= center + radius; y++) {
                for (let z = center - radius; z <= center + radius; z++) {
                    if (x >= 0 && x < size && y >= 0 && y < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateSimplePyramid(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        for (let y = 0; y < size; y++) {
            const radius = Math.max(0, Math.floor((size - y) / 2) - 1);
            for (let x = center - radius; x <= center + radius; x++) {
                for (let z = center - radius; z <= center + radius; z++) {
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateSimpleHeart(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        
        // Simplified heart - just a diamond-like shape
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = Math.abs(x - center);
                    const dy = Math.abs(y - center);
                    const dz = Math.abs(z - center);
                    
                    // Simple heart approximation
                    if ((dx + dy + dz) <= Math.floor(size / 2.5)) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
}