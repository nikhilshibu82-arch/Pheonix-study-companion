/**
 * app.js - Main Application Controller, SPA Router, & Event Orchestrator
 */

class AegisApp {
  constructor() {
    this.currentView = 'dashboard';

    // Focus Statistics
    this.totalFocusMins = parseInt(localStorage.getItem('aegis_total_focus_mins') || '0');
    this.streakCount = parseInt(localStorage.getItem('aegis_streak_count') || '1');
    this.lastFocusDate = localStorage.getItem('aegis_last_focus_date') || '';
  }

  async init() {
    // 1. Initialize Sub-modules
    await window.AegisStorage.init();
    window.AegisPomodoroTimer.init();
    window.AegisFlashcardManager.init();
    window.AegisStudyPlanner.init();

    // 2. Setup SPA Router & Global Events
    this.setupRouter();
    this.setupSettingsModal();
    this.setupGlobalEventListeners();

    // 3. Setup Library Document Upload UI
    this.setupLibraryUI();

    // 4. Initial Statistics Render
    this.renderStats();
    this.checkStreak();
    this.renderStreakGauge();

    // 5. Initialize Icons
    lucide.createIcons();
  }

  setupRouter() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');

    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const viewName = item.getAttribute('data-view');
        if (viewName) {
          this.switchView(viewName);
        }
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Toggle active sidebar link
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sidebar-menu .menu-item[data-view="${viewName}"]`).classList.add('active');

    // Toggle visible panels
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Section specific lifecycle hooks
    if (viewName === 'library') {
      this.refreshLibraryFiles();
    } else if (viewName === 'dashboard') {
      this.renderStats();
      window.AegisStudyPlanner.renderActivePlanOnDashboard();
    }
  }

  setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const trigger = document.getElementById('settings-trigger');
    const closeBtn = document.getElementById('settings-btn-close');
    const cancelBtn = document.getElementById('settings-btn-cancel');
    const saveBtn = document.getElementById('settings-btn-save');

    // Open settings
    const openSettings = () => {
      document.getElementById('settings-spotify-uri').value = localStorage.getItem('aegis_spotify_playlist') || '';
      modal.classList.add('active');
    };

    trigger.addEventListener('click', openSettings);

    // Close settings
    const closeSettings = () => modal.classList.remove('active');
    closeBtn.addEventListener('click', closeSettings);
    cancelBtn.addEventListener('click', closeSettings);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSettings();
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
      const spotifyUrl = document.getElementById('settings-spotify-uri').value.trim();

      if (spotifyUrl) {
        localStorage.setItem('aegis_spotify_playlist', spotifyUrl);
        window.AegisPomodoroTimer.setupSpotifyPlayer(spotifyUrl);
        // Sync Spotify input in Pomodoro panel
        document.getElementById('spotify-playlist-url').value = spotifyUrl;
      }

      closeSettings();
    });
  }

  setupGlobalEventListeners() {
    // 1. Focus block complete listener
    window.addEventListener('aegis_focus_completed', (e) => {
      const mins = e.detail.minutes;
      this.totalFocusMins += mins;
      localStorage.setItem('aegis_total_focus_mins', this.totalFocusMins);
      this.updateStreak();
      this.renderStats();
    });

    // 2. Decks stats update listener
    window.addEventListener('aegis_cards_count_change', (e) => {
      this.renderStats();
    });

    // 3. Target Exam stats update listener
    window.addEventListener('aegis_exam_change', (e) => {
      this.renderStats();
    });
  }

  setupLibraryUI() {
    const dropzone = document.getElementById('document-dropzone');
    const fileInput = document.getElementById('document-file-input');

    // Click dropzone to select files
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleUploadQueue(e.target.files);
      }
    });

    // Drag and Drop files
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleUploadQueue(e.dataTransfer.files);
      }
    });
  }

  async handleUploadQueue(files) {
    const uploadText = document.querySelector('#document-dropzone h3');
    uploadText.innerHTML = '<i class="pulse" data-lucide="loader" style="vertical-align:middle; margin-right:0.5rem; animation: spin 1s infinite linear;"></i>Uploading files...';
    lucide.createIcons();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Enforce file size limit of 15MB
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB limit.`);
        continue;
      }

      try {
        await window.AegisStorage.uploadDocument(file);
      } catch (err) {
        console.error('File upload failed for ' + file.name + ':', err);
        alert(`Failed to upload ${file.name} locally.`);
      }
    }

    uploadText.innerText = 'Select or Drop study documents here';
    this.refreshLibraryFiles();
    this.renderStats();
  }

  async refreshLibraryFiles() {
    const grid = document.getElementById('library-docs-grid');
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-secondary);"><i data-lucide="loader" style="animation: spin 1s infinite linear; vertical-align:middle; margin-right:0.5rem;"></i>Indexing study folder...</p>';
    lucide.createIcons();

    try {
      const docs = await window.AegisStorage.getDocuments();
      grid.innerHTML = '';

      if (docs.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">No documents uploaded yet. Upload a syllabus cheat sheet or exam syllabus to get started.</p>';
        return;
      }

      docs.forEach(doc => {
        const docBox = document.createElement('div');
        docBox.className = 'doc-card glass-interactive';

        // Size formatting
        const kb = Math.round((doc.size / 1024) * 10) / 10;
        const sizeStr = kb > 1020 ? `${(Math.round((kb / 1024) * 10) / 10)} MB` : `${kb} KB`;

        // Date formatting
        const date = new Date(doc.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        // Select icon based on file type
        let iconType = 'file-text';
        if (doc.type.includes('pdf')) iconType = 'file-digit';
        else if (doc.type.includes('image')) iconType = 'file-image';

        docBox.innerHTML = `
          <div class="doc-icon"><i data-lucide="${iconType}"></i></div>
          <div class="doc-info">
            <div class="doc-name" title="${doc.name}">${doc.name}</div>
            <div class="doc-meta">
              <span>${sizeStr}</span>
              <span>•</span>
              <span>${date}</span>
            </div>
          </div>
          <div class="doc-actions">
            <button class="doc-btn-delete" title="Delete file"><i data-lucide="trash-2" style="width:14px;"></i></button>
          </div>
        `;

        // Bind delete action
        docBox.querySelector('.doc-btn-delete').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
            const success = await window.AegisStorage.deleteDocument(doc.id);
            if (success) {
              this.refreshLibraryFiles();
              this.renderStats();
            } else {
              alert('Delete failed.');
            }
          }
        });

        grid.appendChild(docBox);
      });
      lucide.createIcons();

    } catch (e) {
      console.error(e);
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--danger);">Failed to retrieve file index directory.</p>';
    }
  }

  async renderStats() {
    try {
      const res = await fetch('/api/timer');
      if (res.ok) {
        const statsData = await res.json();
        this.totalFocusMins = statsData.totalFocusMins || this.totalFocusMins;
        if (statsData.streakCount) this.streakCount = statsData.streakCount;
        if (statsData.targetExam && statsData.targetExam !== 'None Selected') {
          localStorage.setItem('aegis_target_exam', statsData.targetExam);
        }
      }
    } catch (e) {
      console.warn('Java backend stats offline:', e);
    }

    // 1. Total Focus Hour display
    const hrs = Math.floor(this.totalFocusMins / 60);
    const mins = this.totalFocusMins % 60;
    const focusStat = document.getElementById('dash-stat-focus');
    if (focusStat) {
      focusStat.innerText = `${hrs}h ${mins}m`;
    }

    // 2. Target Exam display
    const targetExam = localStorage.getItem('aegis_target_exam') || 'None Selected';
    const examStat = document.getElementById('dash-stat-exam');
    if (examStat) {
      examStat.innerText = targetExam;
      examStat.title = targetExam;
      if (targetExam.length > 14) {
        examStat.innerText = targetExam.substr(0, 13) + '...';
      }
    }

    // 3. Flashcards count
    let cardCount = 0;
    if (window.AegisFlashcardManager && window.AegisFlashcardManager.decks) {
      window.AegisFlashcardManager.decks.forEach(d => cardCount += d.cards.length);
    } else {
      const savedDecks = localStorage.getItem('aegis_flashcard_decks');
      if (savedDecks) {
        try {
          const decks = JSON.parse(savedDecks);
          decks.forEach(d => cardCount += d.cards.length);
        } catch (e) { }
      }
    }
    const cardStat = document.getElementById('dash-stat-cards');
    if (cardStat) {
      cardStat.innerText = cardCount;
    }

    // 4. Stored Documents count
    try {
      const docs = await window.AegisStorage.getDocuments();
      const docStat = document.getElementById('dash-stat-docs');
      if (docStat) {
        docStat.innerText = docs.length;
      }
    } catch (e) { }
  }

  checkStreak() {
    const today = new Date().toDateString();

    if (this.lastFocusDate) {
      const lastDate = new Date(this.lastFocusDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak broken
        this.streakCount = 0;
        localStorage.setItem('aegis_streak_count', 0);
      }
    }
  }

  updateStreak() {
    const today = new Date().toDateString();

    if (this.lastFocusDate !== today) {
      this.streakCount++;
      this.lastFocusDate = today;
      localStorage.setItem('aegis_streak_count', this.streakCount);
      localStorage.setItem('aegis_last_focus_date', today);
      this.renderStreakGauge();
    }
  }

  renderStreakGauge() {
    const gauge = document.getElementById('streak-gauge');
    if (!gauge) return;

    gauge.innerHTML = '';

    // Render 7 streak flame nodes representing continuous study habit levels
    const totalFlames = 7;
    const filledFlames = Math.min(totalFlames, this.streakCount);

    for (let i = 0; i < totalFlames; i++) {
      const flame = document.createElement('div');
      flame.style.width = '32px';
      flame.style.height = '32px';
      flame.style.borderRadius = '50%';
      flame.style.display = 'flex';
      flame.style.alignItems = 'center';
      flame.style.justifyContent = 'center';
      flame.style.fontSize = '0.9rem';

      if (i < filledFlames) {
        flame.style.background = 'rgba(236, 72, 153, 0.15)';
        flame.style.color = 'var(--accent)';
        flame.style.border = '1px solid rgba(236, 72, 153, 0.3)';
        flame.innerHTML = '<i data-lucide="flame" style="width:14px;"></i>';
      } else {
        flame.style.background = 'rgba(255, 255, 255, 0.03)';
        flame.style.color = 'var(--text-muted)';
        flame.style.border = '1px solid var(--border-color)';
        flame.innerHTML = '<i data-lucide="circle" style="width:10px;"></i>';
      }

      gauge.appendChild(flame);
    }
    lucide.createIcons();
  }
}

// Spin rotation animation helper in styles
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const App = new AegisApp();
  window.AegisAppInstance = App;
  App.init();
});
