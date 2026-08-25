# Pheonix-Study Companion

Pheonix-Study Companion is a premium, client-side single-page web application designed for students preparing for high-intensity competitive examinations (such as UPSC Civil Services, JEE Main & Advanced, NEET, GRE/GMAT, and GATE). 

It features a modern, dark glassmorphic interface that integrates study schedule suggestion generators, active recall flashcard systems, customizable Pomodoro clocks with procedural ambient focus audio synthesis, and a sandboxed offline file storage system.

---

## 🗺️ Architecture & Workflow

```mermaid
graph TD
    Start[User Opens Application] --> Dash[Dashboard Interface]
    
    Dash -->|Select target exam & hours| Plan[Syllabus suggestion Planner]
    Plan -->|Weekly Syllabus suggestion| PlanGen{Planner Suggestion Engine}
    PlanGen -->|Apply Plan| Dash
    
    Dash -->|Start Study Block| Pomo[Pomodoro Focus Timer]
    Pomo -->|Procedural focus sounds| Audio{Web Audio API Synthesizer}
    Audio -->|Deep Rumble| Brown[Brown Noise Node]
    Audio -->|40Hz Delta Beat| Bin[Binaural Beat Oscillators]
    Audio -->|Procedural droplet crackles| Rain[Storm Rain Node]
    Pomo -->|Completion Alert| Session[Increment Total Focus Hours]
    Session -->|Update Stats| Dash
    
    Dash -->|Review Core Concepts| Flash[Active Recall Decks]
    Flash -->|Interactive 3D Flip| Card[Card Face Review]
    Card -->|Self Assessment Rating| Leit{Leitner System Scheduler}
    Leit -->|Score 1: Forgot It| QueueLow[Move to Low Confidence Queue]
    Leit -->|Score 5: Mastered| QueueHigh[Mark Mastered / Increase Interval]
    
    Dash -->|Manage Cheat Sheets & SYQs| Doc[Local Document Hub]
    Doc -->|Drag & Drop file| FileRead[FileReader API]
    FileRead -->|Base64 Conversion| DB[(IndexedDB Storage)]
    DB -->|Fetch Index List| Doc
```

---

## 🔄 App Workflows

1. **Dashboard Home**: Consolidates focus hours, study streaks, and exam configurations. If a schedule has been compiled, it highlights the target tasks for the current day.
2. **Syllabus Suggestion Planner**: The student enters their target competitive exam, study hours per day, and prep timeline. The planner compiles a custom 7-day study breakdown allocating subjects, revisions, and full mock tests.
3. **Pomodoro Focus**: Houses the custom timer. Students select a countdown duration (Focus, Short Break, or Long Break) and trigger procedurally synthesized study music or their linked Spotify embed widget to eliminate ambient distractions.
4. **Active Recall**: Students review custom or pre-seeded study decks. On card flip, they rate their memory confidence, which updates the card's spacing queue.
5. **Document Sync Hub**: Upload zone supporting PDFs, study notes, and syllabus spreadsheets. Files are stored locally on the device, ensuring they are persistently available and load instantly without cloud configuration.

---

## 🧮 Algorithms & Specifications

### 1. Web Audio Procedural Synthesis Algorithm
To provide noise-canceling study aids without relying on network streams, Pheonix implements real-time audio synthesis:
* **Brown Noise**: Generated dynamically by integrating white noise. The algorithm integration formula updates output sample $y(n)$ from white noise input $x(n)$ using a single-pole filter:
  $$y(n) = \frac{y(n-1) + 0.02 \cdot x(n)}{1.02}$$
  The signal is then multiplied by a compensation gain factor of $3.5$ to balance volume.
* **40Hz Binaural Beats**: Employs two standard `OscillatorNode` sources. The left channel is panned and set to $200\text{ Hz}$, and the right channel is set to $240\text{ Hz}$. When listened to through headphones, the auditory cortex perceives a binaural difference of $40\text{ Hz}$, which matches the frequency of Gamma brainwaves associated with high concentration.
* **Synthesized Rain**: Combines a low-pass filtered brown noise node ($400\text{ Hz}$ cutoff) with rare, random high-amplitude impulse spikes ($p > 0.997$ per sample) routed through a high-pass filter ($1200\text{ Hz}$ cutoff) to simulate rain droplets hitting leaves.

### 2. Leitner System Recall Spacing Algorithm
To optimize active recall retention, flashcard scheduling operates on a custom Leitner rating system:
1. Card starts at `confidence = 1`.
2. When reviewed, the student chooses self-assessment options:
   * **Forgot It (Score 1)**: Immediately resets `confidence = 1`.
   * **Struggled (Score 3)**: Retains `confidence` levels, prompting sooner reviews.
   * **Mastered (Score 5)**: Sets `confidence = 5`.
3. The Active Study Session sorts the active review queue using the formula:
   $$\text{Queue Priority} = \text{Sort}(\text{cards}, \text{key} = \text{confidence } \text{ascending})$$
   This guarantees that items the student has forgotten or struggled with are shown first.

### 3. Sandbox Offline File Upload Lifecycle
To store documents securely without database servers, Pheonix implements the following upload path:
```
[File selected/dropped] ──> [FileReader reads as DataURL] ──> [Base64 String Created]
                                                                     │
[Document Grid Updates] <── [Put inside Object Store] <── [IndexedDB write transaction]
```
Files remain sandbox-isolated, meaning they do not leave the client device, preserving privacy and enabling complete offline operation.

---

## 📖 Detailed Feature Guide

### 1. Generating & Following Your Study Plan
* **Configure Target**: Go to the **Study Planner** tab in the sidebar.
* **Select Parameters**: Choose your target exam from the dropdown (UPSC, JEE, NEET, GRE, GATE, or Custom). Input your target study hours per day (e.g., 6 hours) and your revision timeline.
* **Review Schedule**: Click **"Generate Study Schedule"** to display your custom 7-day weekly calendar.
* **Sync Dashboard**: Click **"Apply Plan to Dashboard"**. Pheonix saves this configuration and highlights the current day's target on your main **Dashboard** tab.

### 2. Operating the Pomodoro Focus Timer
* **Set Intervals**: Navigate to **Pomodoro Focus**. Toggle between default intervals (Pomodoro: 25m, Short Break: 5m, Long Break: 15m) or click **"Custom Timings"** to set custom minute intervals.
* **Ambient Audio Synthesis**: Click any of the four ambient sound cards (Brown Noise, Binaural Beats, Forest Rain, Lo-Fi Chill) to trigger procedural offline focus audio. Use the volume slider to adjust.
* **Link Spotify**: Copy the link to your favorite playlist, track, or album from Spotify. Paste it in the input field under **Personal Spotify Hub** and click **"Load"**. The app will parse the link type and mount a custom dark-themed Spotify player.

### 3. Reviewing Flashcards (Active Recall)
* **Select a Deck**: Go to the **Flashcards** tab. Click **"Study"** on any of the three pre-seeded decks or click **"Create New Deck"** at the top right to start a new deck.
* **Card Interaction**: The active card is displayed. Read the question, then click the card to flip it with a 3D animation and reveal the answer.
* **Self-Assessment Rating**: Select one of the three options:
  * *Forgot It*: Pushes the card back to the front of your study queue.
  * *Struggled*: Spreads the card out for sooner review.
  * *Mastered*: Moves the card to your completed queue and marks it as Mastered.
* **Add Cards**: Click **"Add Card"** at the top right of the study panel to append custom formula or concept pairs.

### 4. Uploading & Accessing Documents (Local Hub)
* **Save Files**: Navigate to **Document Hub**.
* **Upload Notes**: Select your notes file or drag-and-drop it directly into the upload box. Supporting PDFs, images, text, and docx notes (Max 15MB).
* **Retrieve Documents**: Files are rendered in a clean grid showing upload date, file type, and file size. Click any PDF or file to read, study, or download.
* **Delete Items**: Click the trash icon next to a file to delete it from the browser's persistent IndexedDB database.

---

## 🛠️ Local Installation & Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/nikhilshibu82-arch/Pheonix-study-companion.git
   cd Pheonix-study-companion
   ```
2. Compile and launch the Java REST Backend Server:
   * **Windows (PowerShell)**:
     ```powershell
     javac -d bin (Get-ChildItem -Recurse -Filter *.java src).FullName
     java -cp bin com.pheonix.PheonixServer
     ```
   * **Linux / macOS**:
     ```bash
     mkdir -p bin
     javac -d bin $(find src -name "*.java")
     java -cp bin com.pheonix.PheonixServer
     ```
3. Open your web browser and navigate to `http://localhost:8080`.

