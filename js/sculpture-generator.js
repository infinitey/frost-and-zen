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
        // Progressive difficulty with 21 levels total
        let size, unstableChance, iceMultiplier, difficultyTier;
        
        // Tier 1: Beginner (Levels 1-3)
        if (level <= 3) {
            size = 4;
            unstableChance = 0.05;
            iceMultiplier = 1.0; // 1x glass count
            difficultyTier = 1;
        }
        // Tier 2: Easy (Levels 4-6)
        else if (level <= 6) {
            size = 5;
            unstableChance = 0.08;
            iceMultiplier = 1.1; // 1.1x glass count
            difficultyTier = 2;
        }
        // Tier 3: Medium (Levels 7-9)
        else if (level <= 9) {
            size = 6;
            unstableChance = 0.1;
            iceMultiplier = 1.2; // 1.2x glass count
            difficultyTier = 3;
        }
        // Tier 4: Hard (Levels 10-15)
        else if (level <= 15) {
            size = 7;
            unstableChance = 0.12;
            iceMultiplier = 1.3; // 1.3x glass count
            difficultyTier = 4;
        }
        // Tier 5: Expert (Levels 16-21)
        else {
            size = 8;
            unstableChance = 0.15;
            iceMultiplier = 1.4; // 1.4x glass count
            difficultyTier = 5;
        }
        
        const center = Math.floor(size / 2);
        
        // Define 21 unique sculpture patterns with increasing complexity
        const sculptures = [
            // Tier 1: Beginner (1-3) - Simple solid shapes
            this.generateSimpleCube(size),           // Level 1
            this.generateSimplePyramid(size),        // Level 2
            this.generateSimpleSphere(size),         // Level 3
            
            // Tier 2: Easy (4-6) - Basic geometric shapes
            this.generateDiamond(size),              // Level 4
            this.generateSimpleHeart(size),          // Level 5
            this.generateCross(size),                // Level 6
            
            // Tier 3: Medium (7-9) - Shapes with holes/complexity
            this.generateDonut(size),                // Level 7
            this.generateStarfish(size),             // Level 8
            this.generateHollowCube(size),           // Level 9
            
            // Tier 4: Hard (10-15) - Complex multi-part structures
            this.generateSpiral(size),               // Level 10
            this.generateFlower(size),               // Level 11
            this.generateTower(size),                // Level 12
            this.generateBridge(size),               // Level 13
            this.generateCastle(size),               // Level 14
            this.generateMaze(size),                 // Level 15
            
            // Tier 5: Expert (16-21) - Highly complex architectural forms
            this.generateTemple(size),               // Level 16
            this.generateSpaceStation(size),         // Level 17
            this.generateDragon(size),               // Level 18
            this.generateGalaxy(size),               // Level 19
            this.generateLabyrinth(size),            // Level 20
            this.generateFinalBoss(size)             // Level 21
        ];
        
        const sculpturePattern = sculptures[Math.min(level - 1, sculptures.length - 1)];
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
        
        // Calculate target ice count based on difficulty tier
        const glassCount = glassCubes.length;
        const baseIceCount = Math.round(glassCount * iceMultiplier);
        
        // Add strategic complexity based on difficulty tier
        let targetIceCount;
        if (difficultyTier <= 2) {
            // Beginner/Easy: Simple ice placement
            targetIceCount = baseIceCount;
        } else if (difficultyTier <= 3) {
            // Medium: Add some randomness
            targetIceCount = Math.round(baseIceCount * (0.9 + Math.random() * 0.2));
        } else {
            // Hard/Expert: More strategic ice placement with clustering
            targetIceCount = Math.round(baseIceCount * (0.8 + Math.random() * 0.4));
        }
        
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
            // All ice cubes are now regular ice - no automatic unstable ice
            // Players must use the Unstable Converter tool to create explosive cubes
            voxels.push({
                x: pos.x - center,
                y: pos.y - center,
                z: pos.z - center,
                material: 'ice',
                taps: 0,
                visible: true,
                crackLevel: 0,
                revealed: false, // Regular ice starts hidden
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
            // Tier 1: Beginner (1-3)
            "Simple Cube",           // Level 1
            "Basic Pyramid",         // Level 2
            "Gentle Sphere",         // Level 3
            
            // Tier 2: Easy (4-6)
            "Crystal Diamond",       // Level 4
            "Loving Heart",          // Level 5
            "Sacred Cross",          // Level 6
            
            // Tier 3: Medium (7-9)
            "Magic Donut",           // Level 7
            "Ocean Starfish",        // Level 8
            "Hollow Cube",           // Level 9
            
            // Tier 4: Hard (10-15)
            "Mystic Spiral",         // Level 10
            "Blooming Flower",       // Level 11
            "Ancient Tower",         // Level 12
            "Stone Bridge",          // Level 13
            "Royal Castle",          // Level 14
            "Lost Maze",             // Level 15
            
            // Tier 5: Expert (16-21)
            "Sacred Temple",         // Level 16
            "Space Station",         // Level 17
            "Sleeping Dragon",       // Level 18
            "Spiral Galaxy",         // Level 19
            "Eternal Labyrinth",     // Level 20
            "The Final Challenge"    // Level 21
        ];
        return names[Math.min(level - 1, names.length - 1)];
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
    
    // New sculpture generators for levels 3-21
    static generateSimpleSphere(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const radius = Math.max(1, size / 3);
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance <= radius) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateCross(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        const thickness = Math.max(1, Math.floor(size / 4));
        
        // Vertical beam
        for (let y = 0; y < size; y++) {
            for (let x = center - thickness; x <= center + thickness; x++) {
                for (let z = center - thickness; z <= center + thickness; z++) {
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        // Horizontal beam
        for (let x = 0; x < size; x++) {
            for (let y = center - thickness; y <= center + thickness; y++) {
                for (let z = center - thickness; z <= center + thickness; z++) {
                    if (y >= 0 && y < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        return pattern;
    }
    
    static generateHollowCube(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        const outerRadius = Math.max(2, Math.floor(size / 2.5));
        const innerRadius = Math.max(1, Math.floor(size / 4));
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = Math.abs(x - center);
                    const dy = Math.abs(y - center);
                    const dz = Math.abs(z - center);
                    
                    // Outer cube boundary
                    if (dx <= outerRadius && dy <= outerRadius && dz <= outerRadius) {
                        // Hollow interior
                        if (!(dx < innerRadius && dy < innerRadius && dz < innerRadius)) {
                            pattern[x][y][z] = true;
                        }
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateTower(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        
        for (let y = 0; y < size; y++) {
            const heightRatio = y / (size - 1);
            const radius = Math.max(1, Math.floor((size / 3) * (1 - heightRatio * 0.3)));
            
            for (let x = center - radius; x <= center + radius; x++) {
                for (let z = center - radius; z <= center + radius; z++) {
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        // Create tower walls (hollow)
                        if (x === center - radius || x === center + radius ||
                            z === center - radius || z === center + radius) {
                            pattern[x][y][z] = true;
                        }
                        // Add battlements at top
                        if (y >= size - 2 && (x + z) % 2 === 0) {
                            pattern[x][y][z] = true;
                        }
                    }
                }
            }
        }
        return pattern;
    }
    
    static generateBridge(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        const bridgeHeight = Math.floor(size / 3);
        
        // Bridge deck
        for (let x = 0; x < size; x++) {
            for (let z = center - 1; z <= center + 1; z++) {
                if (z >= 0 && z < size) {
                    pattern[x][bridgeHeight][z] = true;
                }
            }
        }
        
        // Support pillars
        for (let y = 0; y <= bridgeHeight; y++) {
            // Left pillar
            pattern[1][y][center] = true;
            // Right pillar
            pattern[size - 2][y][center] = true;
            // Center pillar
            if (size >= 6) {
                pattern[center][y][center] = true;
            }
        }
        
        // Arches
        for (let x = 2; x < size - 2; x++) {
            const archHeight = bridgeHeight - Math.floor(Math.abs(x - center) / 2);
            if (archHeight > 0) {
                pattern[x][archHeight][center - 1] = true;
                pattern[x][archHeight][center + 1] = true;
            }
        }
        
        return pattern;
    }
    
    static generateCastle(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        const wallHeight = Math.floor(size * 0.6);
        const towerHeight = Math.floor(size * 0.8);
        
        // Outer walls
        for (let y = 0; y < wallHeight; y++) {
            for (let i = 1; i < size - 1; i++) {
                // Front and back walls
                pattern[i][y][1] = true;
                pattern[i][y][size - 2] = true;
                // Left and right walls
                pattern[1][y][i] = true;
                pattern[size - 2][y][i] = true;
            }
        }
        
        // Corner towers
        const towers = [
            [1, 1], [1, size - 2], [size - 2, 1], [size - 2, size - 2]
        ];
        
        towers.forEach(([tx, tz]) => {
            for (let y = 0; y < towerHeight; y++) {
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        const x = tx + dx;
                        const z = tz + dz;
                        if (x >= 0 && x < size && z >= 0 && z < size) {
                            pattern[x][y][z] = true;
                        }
                    }
                }
            }
        });
        
        // Central keep
        for (let y = 0; y < towerHeight; y++) {
            for (let x = center - 1; x <= center + 1; x++) {
                for (let z = center - 1; z <= center + 1; z++) {
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        return pattern;
    }
    
    static generateMaze(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const mazeHeight = Math.floor(size / 2);
        
        // Create maze walls using a simple pattern
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                for (let y = 0; y < mazeHeight; y++) {
                    // Create maze pattern
                    if ((x % 2 === 0 && z % 2 === 0) ||
                        (x === 0 || x === size - 1 || z === 0 || z === size - 1)) {
                        pattern[x][y][z] = true;
                    }
                    // Add some random walls for complexity
                    else if (Math.random() < 0.3 && x % 2 === 1 && z % 2 === 1) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        // Ensure there's always a path by removing some walls
        for (let x = 1; x < size - 1; x += 2) {
            for (let z = 1; z < size - 1; z += 2) {
                pattern[x][0][z] = false; // Clear floor
            }
        }
        
        return pattern;
    }
    
    // Expert level sculptures (16-21)
    static generateTemple(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = Math.floor(size / 2);
        
        // Temple base
        for (let y = 0; y < 2; y++) {
            for (let x = 1; x < size - 1; x++) {
                for (let z = 1; z < size - 1; z++) {
                    pattern[x][y][z] = true;
                }
            }
        }
        
        // Temple columns
        const columnPositions = [
            [2, 2], [2, size - 3], [size - 3, 2], [size - 3, size - 3],
            [center, 2], [center, size - 3], [2, center], [size - 3, center]
        ];
        
        columnPositions.forEach(([x, z]) => {
            if (x >= 0 && x < size && z >= 0 && z < size) {
                for (let y = 2; y < size - 1; y++) {
                    pattern[x][y][z] = true;
                }
            }
        });
        
        // Temple roof
        for (let y = size - 2; y < size; y++) {
            const roofSize = size - (y - (size - 2)) * 2;
            const offset = Math.floor((size - roofSize) / 2);
            for (let x = offset; x < offset + roofSize; x++) {
                for (let z = offset; z < offset + roofSize; z++) {
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        return pattern;
    }
    
    static generateSpaceStation(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const coreRadius = size / 4;
        const ringRadius = size / 2.5;
        
        // Central core
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance <= coreRadius) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        // Rotating rings
        for (let ring = 0; ring < 3; ring++) {
            const ringY = center + (ring - 1) * (size / 4);
            if (ringY >= 0 && ringY < size) {
                for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
                    const x = Math.round(center + Math.cos(angle) * ringRadius);
                    const z = Math.round(center + Math.sin(angle) * ringRadius);
                    
                    if (x >= 0 && x < size && z >= 0 && z < size) {
                        pattern[x][Math.floor(ringY)][z] = true;
                        // Add thickness
                        for (let dy = -1; dy <= 1; dy++) {
                            const y = Math.floor(ringY) + dy;
                            if (y >= 0 && y < size) {
                                pattern[x][y][z] = true;
                            }
                        }
                    }
                }
            }
        }
        
        return pattern;
    }
    
    static generateDragon(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        
        // Dragon body (serpentine)
        for (let t = 0; t < 1; t += 0.05) {
            const x = Math.round(center + (size / 3) * Math.cos(t * Math.PI * 4));
            const y = Math.round(t * (size - 1));
            const z = Math.round(center + (size / 4) * Math.sin(t * Math.PI * 6));
            
            if (x >= 0 && x < size && y >= 0 && y < size && z >= 0 && z < size) {
                // Body thickness
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        const nx = x + dx;
                        const nz = z + dz;
                        if (nx >= 0 && nx < size && nz >= 0 && nz < size) {
                            pattern[nx][y][nz] = true;
                        }
                    }
                }
            }
        }
        
        // Dragon head
        const headY = size - 2;
        for (let x = center - 2; x <= center + 2; x++) {
            for (let z = center - 2; z <= center + 2; z++) {
                if (x >= 0 && x < size && z >= 0 && z < size) {
                    pattern[Math.floor(x)][headY][Math.floor(z)] = true;
                }
            }
        }
        
        // Dragon wings
        for (let wing = 0; wing < 2; wing++) {
            const wingX = center + (wing === 0 ? -size/3 : size/3);
            const wingY = Math.floor(size * 0.7);
            
            for (let span = 0; span < size/2; span++) {
                const x = Math.round(wingX + (wing === 0 ? -span : span));
                const z = Math.round(center + span * 0.5);
                
                if (x >= 0 && x < size && z >= 0 && z < size) {
                    pattern[x][wingY][z] = true;
                }
            }
        }
        
        return pattern;
    }
    
    static generateGalaxy(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        const arms = 4;
        
        // Galactic center
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance <= size / 6) {
                        pattern[x][y][z] = true;
                    }
                }
            }
        }
        
        // Spiral arms
        for (let arm = 0; arm < arms; arm++) {
            for (let r = size / 6; r < size / 2; r += 0.5) {
                const angle = (arm * Math.PI * 2 / arms) + (r / (size / 2)) * Math.PI * 2;
                
                for (let y = 0; y < size; y++) {
                    const heightFactor = Math.exp(-Math.pow((y - center) / (size / 4), 2));
                    
                    if (heightFactor > 0.1) {
                        const x = Math.round(center + r * Math.cos(angle));
                        const z = Math.round(center + r * Math.sin(angle));
                        
                        if (x >= 0 && x < size && z >= 0 && z < size) {
                            if (Math.random() < heightFactor * 0.7) {
                                pattern[x][y][z] = true;
                            }
                        }
                    }
                }
            }
        }
        
        return pattern;
    }
    
    static generateLabyrinth(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const wallHeight = Math.floor(size * 0.8);
        
        // Create complex 3D labyrinth
        for (let level = 0; level < 3; level++) {
            const levelY = Math.floor(level * wallHeight / 3);
            
            for (let x = 0; x < size; x++) {
                for (let z = 0; z < size; z++) {
                    for (let y = levelY; y < levelY + wallHeight / 3; y++) {
                        if (y >= size) break;
                        
                        // Complex maze pattern with multiple levels
                        const mazePattern = (x + z + level) % 3 === 0 ||
                                          (x % 3 === 0 && z % 2 === level % 2) ||
                                          (x === 0 || x === size - 1 || z === 0 || z === size - 1);
                        
                        if (mazePattern) {
                            pattern[x][y][z] = true;
                        }
                    }
                }
            }
        }
        
        // Add bridges between levels
        for (let bridge = 0; bridge < 4; bridge++) {
            const bridgeX = Math.floor(size / 4) + bridge * Math.floor(size / 4);
            const bridgeZ = Math.floor(size / 2);
            
            for (let y = 0; y < wallHeight; y++) {
                if (bridgeX < size && bridgeZ < size) {
                    pattern[bridgeX][y][bridgeZ] = true;
                }
            }
        }
        
        return pattern;
    }
    
    static generateFinalBoss(size) {
        const pattern = Array(size).fill().map(() =>
            Array(size).fill().map(() => Array(size).fill(false))
        );
        
        const center = size / 2;
        
        // Combine multiple complex elements
        
        // Central fortress
        for (let y = 0; y < size * 0.6; y++) {
            const radius = Math.max(1, (size / 3) * (1 - y / (size * 0.6) * 0.3));
            for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                const x = Math.round(center + radius * Math.cos(angle));
                const z = Math.round(center + radius * Math.sin(angle));
                
                if (x >= 0 && x < size && z >= 0 && z < size) {
                    pattern[x][y][z] = true;
                }
            }
        }
        
        // Floating platforms
        for (let platform = 0; platform < 6; platform++) {
            const angle = (platform * Math.PI * 2) / 6;
            const platformX = Math.round(center + (size / 2.5) * Math.cos(angle));
            const platformZ = Math.round(center + (size / 2.5) * Math.sin(angle));
            const platformY = Math.floor(size * 0.7) + platform % 3;
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const x = platformX + dx;
                    const z = platformZ + dz;
                    
                    if (x >= 0 && x < size && z >= 0 && z < size && platformY < size) {
                        pattern[x][platformY][z] = true;
                    }
                }
            }
        }
        
        // Connecting bridges
        for (let bridge = 0; bridge < 3; bridge++) {
            const bridgeY = Math.floor(size * 0.5) + bridge * 2;
            
            for (let x = 0; x < size; x++) {
                const z = Math.round(center + Math.sin(x * 0.5) * (size / 4));
                
                if (z >= 0 && z < size && bridgeY < size) {
                    pattern[x][bridgeY][z] = true;
                }
            }
        }
        
        // Spiral towers at corners
        const corners = [
            [1, 1], [1, size - 2], [size - 2, 1], [size - 2, size - 2]
        ];
        
        corners.forEach(([cornerX, cornerZ]) => {
            for (let y = 0; y < size; y++) {
                const spiralAngle = (y / size) * Math.PI * 4;
                const spiralRadius = 2;
                
                const x = Math.round(cornerX + spiralRadius * Math.cos(spiralAngle));
                const z = Math.round(cornerZ + spiralRadius * Math.sin(spiralAngle));
                
                if (x >= 0 && x < size && z >= 0 && z < size) {
                    pattern[x][y][z] = true;
                }
            }
        });
        
        return pattern;
    }
}