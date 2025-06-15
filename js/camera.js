class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = { x: 0, y: 0, z: -15 };
        this.rotation = { x: 0.3, y: 0.3 };
        
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.initControls();
    }
    
    initControls() {
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.mouseDown) return;
            
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.rotation.y += deltaX * 0.01;
            this.rotation.x += deltaY * 0.01;
            
            // Clamp X rotation to prevent flipping
            this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouseDown = false;
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseDown = true;
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.mouseDown) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.lastMouseX;
            const deltaY = touch.clientY - this.lastMouseY;
            
            this.rotation.y += deltaX * 0.01;
            this.rotation.x += deltaY * 0.01;
            
            this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
            
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouseDown = false;
        });
    }
    
    project3D(x, y, z) {
        // 3D to 2D projection with rotation
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        
        // Rotate around Y axis
        let rotX = x * cosY - z * sinY;
        let rotZ = x * sinY + z * cosY;
        
        // Rotate around X axis
        let rotY = y * cosX - rotZ * sinX;
        rotZ = y * sinX + rotZ * cosX;
        
        // Project to 2D with perspective
        const distance = 12;
        const scale = distance / (distance + rotZ);
        
        return {
            x: this.canvas.width / 2 + rotX * scale * 30,
            y: this.canvas.height / 2 - rotY * scale * 30,
            scale: scale,
            z: rotZ
        };
    }
}