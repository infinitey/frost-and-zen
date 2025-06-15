class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playIceSound(tapCount) {
        this.playSound(200 + tapCount * 50, 0.2, 'square'); // Thud sound
    }
    
    playUnstableIceSound(tapCount) {
        this.playSound(150 + tapCount * 30, 0.3, 'sawtooth'); // Crackling sound
    }
    
    playGlassSound(tapCount) {
        this.playSound(800 + tapCount * 200, 0.3, 'sine'); // Tink sound
    }
    
    playBreakingSound() {
        this.playSound(400, 0.5, 'sawtooth'); // Breaking sound
    }
    
    playChainBreakSound() {
        // Cascading sound effect
        this.playSound(300, 0.4, 'triangle');
        setTimeout(() => this.playSound(250, 0.3, 'triangle'), 100);
        setTimeout(() => this.playSound(200, 0.2, 'triangle'), 200);
    }
    
    playUnstableExplosionSound() {
        // Much more dramatic explosive cascading sound
        this.playSound(80, 0.8, 'sawtooth');
        setTimeout(() => this.playSound(60, 0.7, 'square'), 30);
        setTimeout(() => this.playSound(120, 0.6, 'sawtooth'), 60);
        setTimeout(() => this.playSound(180, 0.5, 'triangle'), 90);
        setTimeout(() => this.playSound(240, 0.4, 'square'), 120);
        setTimeout(() => this.playSound(300, 0.3, 'sine'), 150);
        setTimeout(() => this.playSound(200, 0.4, 'triangle'), 200);
        setTimeout(() => this.playSound(150, 0.3, 'sawtooth'), 250);
    }
    
    playMassiveExplosionSound() {
        // Epic explosion sound for huge destructions
        this.playSound(40, 1.0, 'sawtooth');
        setTimeout(() => this.playSound(30, 0.9, 'square'), 20);
        setTimeout(() => this.playSound(80, 0.8, 'sawtooth'), 40);
        setTimeout(() => this.playSound(160, 0.7, 'triangle'), 80);
        setTimeout(() => this.playSound(320, 0.6, 'square'), 120);
        setTimeout(() => this.playSound(240, 0.5, 'sine'), 160);
        setTimeout(() => this.playSound(180, 0.4, 'triangle'), 200);
        setTimeout(() => this.playSound(120, 0.3, 'sawtooth'), 250);
        setTimeout(() => this.playSound(90, 0.2, 'square'), 300);
    }
    
    playVictorySound() {
        this.playSound(523, 0.5); // Victory sound
    }
}