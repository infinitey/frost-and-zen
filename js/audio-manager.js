class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.musicGainNode = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    async playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.log('Failed to resume audio context for sound:', e);
                return;
            }
        }
        
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
    
    async startBackgroundMusic() {
        if (!this.audioContext || this.backgroundMusic) return;
        
        // Resume audio context if suspended (required by modern browsers)
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed');
            } catch (e) {
                console.log('Failed to resume audio context:', e);
                return;
            }
        }
        
        // Create a soothing ambient background music
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.connect(this.audioContext.destination);
        this.musicGainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime); // Slightly louder for testing
        
        // Create multiple oscillators for a rich, ambient sound
        this.createAmbientLayer(220, 'sine', 0.05); // Low drone - louder for testing
        this.createAmbientLayer(330, 'sine', 0.04); // Mid harmony
        this.createAmbientLayer(440, 'triangle', 0.03); // High shimmer
        
        // Add subtle variations
        setTimeout(() => this.createAmbientLayer(165, 'sine', 0.03), 2000);
        setTimeout(() => this.createAmbientLayer(495, 'triangle', 0.02), 4000);
        
        console.log('Background music started');
    }
    
    createAmbientLayer(baseFreq, type, volume) {
        if (!this.audioContext || !this.musicGainNode) return;
        
        const oscillator = this.audioContext.createOscillator();
        const layerGain = this.audioContext.createGain();
        
        oscillator.connect(layerGain);
        layerGain.connect(this.musicGainNode);
        
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        oscillator.type = type;
        
        // Set volume with subtle fade-in
        layerGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        layerGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);
        
        // Add subtle frequency modulation for organic feel
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, this.audioContext.currentTime);
        lfo.type = 'sine';
        lfoGain.gain.setValueAtTime(2 + Math.random() * 3, this.audioContext.currentTime);
        
        oscillator.start(this.audioContext.currentTime);
        lfo.start(this.audioContext.currentTime);
        
        // Store reference for cleanup
        if (!this.backgroundMusic) this.backgroundMusic = [];
        this.backgroundMusic.push({ oscillator, lfo });
    }
    
    stopBackgroundMusic() {
        if (!this.backgroundMusic) return;
        
        // Fade out music gracefully
        if (this.musicGainNode) {
            this.musicGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
        }
        
        // Stop all oscillators after fade
        setTimeout(() => {
            this.backgroundMusic.forEach(layer => {
                try {
                    layer.oscillator.stop();
                    layer.lfo.stop();
                } catch (e) {
                    // Oscillator might already be stopped
                }
            });
            this.backgroundMusic = null;
            this.musicGainNode = null;
        }, 1100);
    }
}