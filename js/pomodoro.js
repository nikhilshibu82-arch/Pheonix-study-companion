/**
 * pomodoro.js - Focus Timer & Ambient Audio Synthesis Engine
 */

class AegisPomodoro {
  constructor() {
    this.timerInterval = null;
    this.totalSeconds = 25 * 60;
    this.secondsRemaining = this.totalSeconds;
    this.isPaused = true;
    this.currentMode = 'pomodoro'; // 'pomodoro', 'short', 'long'
    this.endTime = 0; // Epoch ms when timer completes
    
    // Configurations (in minutes)
    this.durations = {
      pomodoro: 25,
      short: 5,
      long: 15
    };

    // Web Audio Synthesizer states
    this.audioCtx = null;
    this.masterGain = null;
    this.activeSynthesizers = {};
    this.currentAudioTrack = null; // 'brown-noise', 'binaural', 'rain', 'lofi'
    this.lofiAudioElement = null; // Audio element for streamed track
    this.audioSources = {}; // References to active web audio nodes
  }

  init() {
    this.loadSettings();
    this.registerEvents();
    this.updateDisplay();
    this.setupSpotifyPlayer(localStorage.getItem('aegis_spotify_playlist') || 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhp7wV7G');
  }

  loadSettings() {
    const saved = localStorage.getItem('aegis_timer_durations');
    if (saved) {
      try {
        this.durations = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse timer durations:', e);
      }
    }
    this.resetTimer();
  }

  saveSettings() {
    localStorage.setItem('aegis_timer_durations', JSON.stringify(this.durations));
  }

  registerEvents() {
    // Mode buttons
    document.getElementById('timer-mode-pomodoro').addEventListener('click', () => this.setMode('pomodoro'));
    document.getElementById('timer-mode-short').addEventListener('click', () => this.setMode('short'));
    document.getElementById('timer-mode-long').addEventListener('click', () => this.setMode('long'));

    // Controls
    document.getElementById('timer-btn-toggle').addEventListener('click', () => this.toggleTimer());
    document.getElementById('timer-btn-reset').addEventListener('click', () => this.resetTimer());
    
    // Custom timers settings drawer toggle
    const customInputsDiv = document.getElementById('timer-custom-inputs');
    document.getElementById('timer-btn-custom').addEventListener('click', () => {
      customInputsDiv.style.display = customInputsDiv.style.display === 'none' ? 'block' : 'none';
      document.getElementById('custom-min-pomodoro').value = this.durations.pomodoro;
      document.getElementById('custom-min-short').value = this.durations.short;
      document.getElementById('custom-min-long').value = this.durations.long;
    });

    document.getElementById('timer-btn-save-custom').addEventListener('click', () => {
      this.durations.pomodoro = parseInt(document.getElementById('custom-min-pomodoro').value) || 25;
      this.durations.short = parseInt(document.getElementById('custom-min-short').value) || 5;
      this.durations.long = parseInt(document.getElementById('custom-min-long').value) || 15;
      this.saveSettings();
      customInputsDiv.style.display = 'none';
      this.resetTimer();
    });

    // Sound items click
    const soundCards = document.querySelectorAll('.music-card');
    soundCards.forEach(card => {
      card.addEventListener('click', () => {
        const trackName = card.getAttribute('data-track');
        this.selectAmbientTrack(trackName);
      });
    });

    // Volume adjustment
    document.getElementById('sound-volume-slider').addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
    });

    // Spotify playlist load
    document.getElementById('spotify-btn-load').addEventListener('click', () => {
      const url = document.getElementById('spotify-playlist-url').value.trim();
      if (url) {
        this.setupSpotifyPlayer(url);
        localStorage.setItem('aegis_spotify_playlist', url);
      }
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    
    // UI state toggle active modes
    document.getElementById('timer-mode-pomodoro').classList.remove('active');
    document.getElementById('timer-mode-short').classList.remove('active');
    document.getElementById('timer-mode-long').classList.remove('active');
    
    document.getElementById(`timer-mode-${mode}`).classList.add('active');
    
    const ring = document.getElementById('timer-progress-ring');
    if (mode === 'pomodoro') {
      ring.style.stroke = 'var(--primary)';
      ring.style.filter = 'drop-shadow(0 0 8px var(--primary-glow))';
      document.getElementById('timer-display-status').innerText = 'Focus Block';
    } else {
      ring.style.stroke = 'var(--secondary)';
      ring.style.filter = 'drop-shadow(0 0 8px var(--secondary-glow))';
      document.getElementById('timer-display-status').innerText = 'Break Period';
    }

    this.resetTimer();
  }

  toggleTimer() {
    if (this.isPaused) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  startTimer() {
    this.isPaused = false;
    document.getElementById('timer-play-icon').setAttribute('data-lucide', 'pause');
    lucide.createIcons();
    
    // Calculate precise target timestamp for background reliability
    this.endTime = Date.now() + (this.secondsRemaining * 1000);

    // If timer synth audio is playing, resume Web Audio context
    this.resumeAudioContext();

    this.timerInterval = setInterval(() => {
      const remainingMs = this.endTime - Date.now();
      
      if (remainingMs <= 0) {
        this.completeTimer();
      } else {
        this.secondsRemaining = Math.ceil(remainingMs / 1000);
        this.updateDisplay();
      }
    }, 200);
  }

  pauseTimer() {
    this.isPaused = true;
    document.getElementById('timer-play-icon').setAttribute('data-lucide', 'play');
    lucide.createIcons();
    
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.totalSeconds = this.durations[this.currentMode] * 60;
    this.secondsRemaining = this.totalSeconds;
    this.updateDisplay();
  }

  async completeTimer() {
    this.pauseTimer();
    this.playCompletionSound();
    
    if (this.currentMode === 'pomodoro') {
      const focusedMinutes = this.durations.pomodoro;

      try {
        await fetch('/api/timer/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes: focusedMinutes })
        });
      } catch (e) {
        console.warn('Java backend focus complete offline:', e);
      }

      window.dispatchEvent(new CustomEvent('aegis_focus_completed', { detail: { minutes: focusedMinutes } }));
      alert('Focus block complete! Time to take a refreshing break.');
      this.setMode('short');
    } else {
      alert('Break time is up. Let\'s get back to studying!');
      this.setMode('pomodoro');
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Update Timer text
    document.getElementById('timer-display-time').innerText = formatted;
    document.title = `${formatted} | Pheonix-Study Companion`;

    // Update circular ring progress
    const ring = document.getElementById('timer-progress-ring');
    const width = window.innerWidth;
    
    // Circumference (depends on screen width media-query definitions)
    const r = width <= 480 ? 110 : 140;
    const circumference = 2 * Math.PI * r;
    
    const percentage = ((this.totalSeconds - this.secondsRemaining) / this.totalSeconds) * 100;
    const offset = circumference - (percentage / 100) * circumference;
    
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }

  playCompletionSound() {
    // Synth bell alert
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Unable to play bell sound:', e);
    }
  }

  /* Audio Synthesizers (Web Audio API) */
  initAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.5; // Default 50%
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  resumeAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.initAudioCtx();
    this.masterGain.gain.setValueAtTime(val, this.audioCtx.currentTime);
    if (this.lofiAudioElement) {
      this.lofiAudioElement.volume = val;
    }
  }

  selectAmbientTrack(trackName) {
    this.initAudioCtx();
    this.resumeAudioContext();

    const clickedCard = document.querySelector(`.music-card[data-track="${trackName}"]`);

    // If clicking active track, stop it (toggle off)
    if (this.currentAudioTrack === trackName) {
      this.stopAllAudio();
      clickedCard.classList.remove('active');
      this.currentAudioTrack = null;
      return;
    }

    // Reset visual classes
    document.querySelectorAll('.music-card').forEach(card => card.classList.remove('active'));
    this.stopAllAudio();

    // Set new track
    this.currentAudioTrack = trackName;
    clickedCard.classList.add('active');

    try {
      if (trackName === 'brown-noise') {
        this.playBrownNoise();
      } else if (trackName === 'binaural') {
        this.playBinauralBeats();
      } else if (trackName === 'rain') {
        this.playSynthesizedRain();
      } else if (trackName === 'lofi') {
        this.playLofiStream();
      }
    } catch (err) {
      console.error('Web Audio Synth failed for track ' + trackName + ':', err);
    }
  }

  stopAllAudio() {
    // Disconnect and stop all Web Audio nodes
    Object.keys(this.audioSources).forEach(key => {
      try {
        if (this.audioSources[key].stop) {
          this.audioSources[key].stop();
        }
        this.audioSources[key].disconnect();
      } catch (e) {
        // Suppress errors for static nodes
      }
    });
    this.audioSources = {};

    // Stop streams
    if (this.lofiAudioElement) {
      this.lofiAudioElement.pause();
      this.lofiAudioElement = null;
    }
  }

  // Synthesize Brown Focus Noise
  playBrownNoise() {
    const bufferSize = 4096;
    let lastOut = 0.0;
    
    const node = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
      }
    };

    node.connect(this.masterGain);
    this.audioSources['brown-noise-node'] = node;
  }

  // Synthesize 40Hz Binaural focus beats
  playBinauralBeats() {
    const oscL = this.audioCtx.createOscillator();
    const oscR = this.audioCtx.createOscillator();
    oscL.frequency.setValueAtTime(200, this.audioCtx.currentTime); // 200 Hz
    oscR.frequency.setValueAtTime(240, this.audioCtx.currentTime); // 240 Hz (40Hz delta)

    const merger = this.audioCtx.createChannelMerger(2);
    
    const gainL = this.audioCtx.createGain();
    const gainR = this.audioCtx.createGain();
    gainL.gain.value = 0.8;
    gainR.gain.value = 0.8;

    oscL.connect(gainL);
    oscR.connect(gainR);
    
    gainL.connect(merger, 0, 0); // channel 0 (left)
    gainR.connect(merger, 0, 1); // channel 1 (right)

    merger.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.audioSources['binaural-osc-l'] = oscL;
    this.audioSources['binaural-osc-r'] = oscR;
    this.audioSources['binaural-merger'] = merger;
  }

  // Synthesize Rain droplets combined with deep brown noise hum
  playSynthesizedRain() {
    const bufferSize = 4096;
    
    // 1. Rain crackles (Droplets)
    const crackleNode = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
    crackleNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        let crackle = 0;
        if (Math.random() > 0.997) {
          crackle = Math.random() * 2 - 1;
        }
        output[i] = crackle * 0.45 + (Math.random() * 0.04);
      }
    };
    
    const highpass = this.audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1200;

    crackleNode.connect(highpass);
    highpass.connect(this.masterGain);

    // 2. Heavy rain background wash (Brown noise rumble)
    let lastOut = 0.0;
    const rumbler = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
    rumbler.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.015 * white)) / 1.015;
        lastOut = output[i];
        output[i] *= 1.8;
      }
    };
    
    const lowpass = this.audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    rumbler.connect(lowpass);
    lowpass.connect(this.masterGain);

    this.audioSources['rain-crackle'] = crackleNode;
    this.audioSources['rain-highpass'] = highpass;
    this.audioSources['rain-rumble'] = rumbler;
    this.audioSources['rain-lowpass'] = lowpass;
  }

  // Stream lofi study loop from copyright-free CDN
  playLofiStream() {
    this.lofiAudioElement = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');
    this.lofiAudioElement.loop = true;
    this.lofiAudioElement.volume = this.masterGain.gain.value;
    
    // Connect to Web Audio graph for volume adjustments
    const sourceNode = this.audioCtx.createMediaElementSource(this.lofiAudioElement);
    sourceNode.connect(this.masterGain);
    
    this.lofiAudioElement.play();
    this.audioSources['lofi-element-source'] = sourceNode;
  }

  /* Spotify Iframe Builder */
  setupSpotifyPlayer(urlOrUri) {
    let type = 'playlist';
    let id = '37i9dQZF1DX8Uebhp7wV7G'; // Fallback focus playlist
    
    if (urlOrUri) {
      // Regex parsing URLs or URIs for playlists, tracks, albums, or artists
      // Matches open.spotify.com/{type}/{id} or spotify:{type}:{id}
      const urlMatch = urlOrUri.match(/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/i);
      const uriMatch = urlOrUri.match(/spotify:(playlist|track|album|artist):([a-zA-Z0-9]+)/i);
      
      if (urlMatch) {
        type = urlMatch[1].toLowerCase();
        id = urlMatch[2];
      } else if (uriMatch) {
        type = uriMatch[1].toLowerCase();
        id = uriMatch[2];
      } else if (urlOrUri.length > 10 && !urlOrUri.includes(':') && !urlOrUri.includes('/')) {
        id = urlOrUri;
      }
    }

    const container = document.getElementById('spotify-widget-container');
    container.innerHTML = `
      <iframe 
        style="border-radius:12px" 
        src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0" 
        width="100%" 
        height="152" 
        frameBorder="0" 
        allowfullscreen="" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy">
      </iframe>`;
  }
}

// Global Pomodoro instance
const AegisPomodoroTimer = new AegisPomodoro();
window.AegisPomodoroTimer = AegisPomodoroTimer;
