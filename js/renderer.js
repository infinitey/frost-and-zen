class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderCube(voxel, camera) {
        const pos = camera.project3D(voxel.x, voxel.y, voxel.z);
        const cubeSize = 30 * pos.scale;
        
        // Calculate cube vertices in 3D space
        const vertices = [
            // Front face
            { x: voxel.x - 0.5, y: voxel.y - 0.5, z: voxel.z + 0.5 },
            { x: voxel.x + 0.5, y: voxel.y - 0.5, z: voxel.z + 0.5 },
            { x: voxel.x + 0.5, y: voxel.y + 0.5, z: voxel.z + 0.5 },
            { x: voxel.x - 0.5, y: voxel.y + 0.5, z: voxel.z + 0.5 },
            // Back face
            { x: voxel.x - 0.5, y: voxel.y - 0.5, z: voxel.z - 0.5 },
            { x: voxel.x + 0.5, y: voxel.y - 0.5, z: voxel.z - 0.5 },
            { x: voxel.x + 0.5, y: voxel.y + 0.5, z: voxel.z - 0.5 },
            { x: voxel.x - 0.5, y: voxel.y + 0.5, z: voxel.z - 0.5 }
        ];
        
        // Project all vertices
        const projectedVertices = vertices.map(v => camera.project3D(v.x, v.y, v.z));
        
        // Define cube faces (indices into vertices array)
        const faces = [
            { indices: [0, 1, 2, 3], normal: { x: 0, y: 0, z: 1 } },  // Front
            { indices: [5, 4, 7, 6], normal: { x: 0, y: 0, z: -1 } }, // Back
            { indices: [4, 0, 3, 7], normal: { x: -1, y: 0, z: 0 } }, // Left
            { indices: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 } },  // Right
            { indices: [3, 2, 6, 7], normal: { x: 0, y: 1, z: 0 } },  // Top
            { indices: [4, 5, 1, 0], normal: { x: 0, y: -1, z: 0 } }  // Bottom
        ];
        
        // Calculate lighting for each face
        const lightDir = { x: 0.5, y: -0.7, z: 0.5 };
        
        // Base colors - ALL CUBES LOOK IDENTICAL UNTIL CRACKED (3D Minesweeper style)
        let baseColor, strokeColor;
        
        // Only reveal material through cracks or special conditions
        if (voxel.crackLevel > 0 || voxel.revealed) {
            // Material is revealed through cracking or isolation
            if (voxel.material === 'ice') {
                if (voxel.weakened) {
                    baseColor = { r: 150, g: 200, b: 255 }; // Lighter blue for weakened ice
                    strokeColor = 'rgba(100, 150, 255, 0.8)';
                } else {
                    baseColor = { r: 100, g: 181, b: 246 };
                    strokeColor = 'rgba(33, 150, 243, 0.8)';
                }
            } else if (voxel.material === 'unstable_ice') {
                // Pulsing orange/red for unstable ice
                const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                baseColor = { r: Math.floor(255 * pulse), g: Math.floor(100 * pulse), b: 50 };
                strokeColor = `rgba(255, 69, 0, ${0.8 + pulse * 0.2})`;
            } else {
                baseColor = { r: 255, g: 255, b: 255 };
                strokeColor = 'rgba(255, 255, 255, 0.9)';
            }
        } else {
            // All uncracked cubes look identical - neutral gray
            baseColor = { r: 180, g: 180, b: 180 };
            strokeColor = 'rgba(120, 120, 120, 0.8)';
        }
        
        // Sort faces by depth (back to front)
        const sortedFaces = faces.map(face => {
            const centerZ = face.indices.reduce((sum, i) => sum + projectedVertices[i].z, 0) / 4;
            return { ...face, centerZ };
        }).sort((a, b) => b.centerZ - a.centerZ);
        
        // Render each visible face
        sortedFaces.forEach(face => {
            // Calculate lighting
            const lightIntensity = Math.max(0.3, Math.min(1.0, 
                -face.normal.x * lightDir.x - 
                face.normal.y * lightDir.y - 
                face.normal.z * lightDir.z + 0.5
            ));
            
            // Apply lighting to color
            const r = Math.floor(baseColor.r * lightIntensity);
            const g = Math.floor(baseColor.g * lightIntensity);
            const b = Math.floor(baseColor.b * lightIntensity);
            let alpha = 0.8; // Default alpha for unknown cubes
            if (voxel.crackLevel > 0 || voxel.revealed) {
                alpha = voxel.material === 'ice' ? 0.9 : 0.4;
            }
            
            // Draw face
            this.ctx.beginPath();
            const firstVertex = projectedVertices[face.indices[0]];
            this.ctx.moveTo(firstVertex.x, firstVertex.y);
            
            for (let i = 1; i < face.indices.length; i++) {
                const vertex = projectedVertices[face.indices[i]];
                this.ctx.lineTo(vertex.x, vertex.y);
            }
            this.ctx.closePath();
            
            // Apply special effects
            let finalR = r, finalG = g, finalB = b, finalAlpha = alpha;
            
            // Scanner effect - blue X-ray glow
            if (voxel.scanned && voxel.scanTime && Date.now() - voxel.scanTime < 3000) {
                const scanIntensity = 1 - (Date.now() - voxel.scanTime) / 3000;
                finalR = Math.min(255, r + 100 * scanIntensity);
                finalG = Math.min(255, g + 150 * scanIntensity);
                finalB = Math.min(255, b + 255 * scanIntensity);
                finalAlpha = Math.min(1, alpha + 0.3 * scanIntensity);
            }
            
            // Magnet effect - purple magnetic glow
            if (voxel.magnetized && voxel.magnetTime && Date.now() - voxel.magnetTime < 2000) {
                const magnetIntensity = 1 - (Date.now() - voxel.magnetTime) / 2000;
                finalR = Math.min(255, r + 150 * magnetIntensity);
                finalG = Math.min(255, g + 50 * magnetIntensity);
                finalB = Math.min(255, b + 200 * magnetIntensity);
                finalAlpha = Math.min(1, alpha + 0.2 * magnetIntensity);
            }
            
            // Tap shine effect (highest priority)
            if (voxel.lastTapped && Date.now() - voxel.lastTapped < 300) {
                const shineIntensity = 1 - (Date.now() - voxel.lastTapped) / 300;
                if (voxel.material === 'ice') {
                    // Blue shine for ice
                    finalR = Math.min(255, finalR + 50 * shineIntensity);
                    finalG = Math.min(255, finalG + 100 * shineIntensity);
                    finalB = Math.min(255, finalB + 150 * shineIntensity);
                } else {
                    // Golden shine for glass
                    finalR = Math.min(255, finalR + 100 * shineIntensity);
                    finalG = Math.min(255, finalG + 80 * shineIntensity);
                    finalB = Math.min(255, finalB + 20 * shineIntensity);
                }
            }
            
            this.ctx.fillStyle = `rgba(${finalR}, ${finalG}, ${finalB}, ${finalAlpha})`;
            this.ctx.fill();
            
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
        
        // Draw realistic cracks on the front face if any
        if (voxel.crackLevel > 0) {
            const frontFace = projectedVertices.slice(0, 4);
            const centerX = frontFace.reduce((sum, v) => sum + v.x, 0) / 4;
            const centerY = frontFace.reduce((sum, v) => sum + v.y, 0) / 4;
            
            // Different crack colors for different materials
            if (voxel.crackLevel > 0 || voxel.revealed) {
                this.ctx.strokeStyle = voxel.material === 'ice' ? '#1976D2' : '#FFC107';
            } else {
                this.ctx.strokeStyle = '#666666'; // Generic crack color for unknown material
            }
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            
            // Create more realistic jagged crack patterns
            for (let i = 0; i < voxel.crackLevel; i++) {
                const baseAngle = (i * Math.PI * 2) / Math.max(3, voxel.crackLevel);
                const mainLength = cubeSize * 0.4;
                
                // Main crack line with jagged segments
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                
                const segments = 3 + Math.floor(Math.random() * 3);
                for (let seg = 1; seg <= segments; seg++) {
                    const progress = seg / segments;
                    const angle = baseAngle + (Math.random() - 0.5) * 0.3;
                    const length = mainLength * progress;
                    const jitter = (Math.random() - 0.5) * 8;
                    
                    const x = centerX + Math.cos(angle) * length + jitter;
                    const y = centerY + Math.sin(angle) * length + jitter;
                    this.ctx.lineTo(x, y);
                }
                this.ctx.stroke();
                
                // Add smaller branch cracks
                if (voxel.crackLevel > 1) {
                    const branchCount = 1 + Math.floor(Math.random() * 2);
                    for (let b = 0; b < branchCount; b++) {
                        const branchAngle = baseAngle + (Math.random() - 0.5) * Math.PI;
                        const branchLength = cubeSize * (0.15 + Math.random() * 0.15);
                        const startProgress = 0.3 + Math.random() * 0.4;
                        
                        const startX = centerX + Math.cos(baseAngle) * mainLength * startProgress;
                        const startY = centerY + Math.sin(baseAngle) * mainLength * startProgress;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(startX, startY);
                        this.ctx.lineTo(
                            startX + Math.cos(branchAngle) * branchLength,
                            startY + Math.sin(branchAngle) * branchLength
                        );
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
    
    renderMiniSculpture(voxels, width, height, camera) {
        this.ctx.clearRect(0, 0, width, height);
        
        voxels.forEach(voxel => {
            const pos = camera.project3D(voxel.x, voxel.y, voxel.z);
            const size = 8;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.lineWidth = 1;
            
            const x = width/2 + pos.x * 0.3;
            const y = height/2 - pos.y * 0.3;
            
            this.ctx.fillRect(x - size/2, y - size/2, size, size);
            this.ctx.strokeRect(x - size/2, y - size/2, size, size);
        });
    }
}