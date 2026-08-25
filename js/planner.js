/**
 * planner.js - Smart Study Planner & Competitive Exam Suggestion Engine
 */

class AegisPlanner {
  constructor() {
    this.activePlan = null;
    
    // Syllabus definitions for competitive exams
    this.examSyllabi = {
      upsc: {
        title: 'UPSC Civil Services (IAS/IPS)',
        subjects: ['Indian Polity & Constitution', 'Modern & Ancient Indian History', 'Physical & Indian Geography', 'Economics & Development', 'General Science & Environment', 'Current Affairs & Editorials', 'CSAT (Aptitude & Comprehension)'],
        strategy: 'UPSC requires highly conceptual depth, current affairs integration, and writing practice. Divide time: 60% Core GS Subjects, 20% Current Affairs, 20% Mock Revision.',
        weeklyPattern: [
          { day: 'Monday', focus: 'Indian Polity & Constitutional Amendments + Daily Newspaper analysis' },
          { day: 'Tuesday', focus: 'Modern Indian History (Freedom Struggle) + Answer Writing Practice' },
          { day: 'Wednesday', focus: 'Physical & Human Geography mapping + Daily Editorial review' },
          { day: 'Thursday', focus: 'Indian Economy basics & Union Budget concepts + MCQ quiz' },
          { day: 'Friday', focus: 'Environment, Ecology & Climate Change notes + CSAT Aptitude practice' },
          { day: 'Saturday', focus: 'Comprehensive Weekly Revision of Polity/History + Editorial consolidation' },
          { day: 'Sunday', focus: 'Full-length GS Sectional Test (3 Hours) + Detailed Error Log Review' }
        ],
        tips: [
          "Never skip newspaper analysis. Link current events with basic GS topics.",
          "Write at least one mains answer daily. Content is useless without articulation.",
          "Solve previous year questions (PYQs) repeatedly. They reveal examiner patterns."
        ]
      },
      jee: {
        title: 'JEE Main & Advanced (Engineering)',
        subjects: ['Physics (Mechanics, Electrodynamics, Modern Physics)', 'Chemistry (Organic, Inorganic, Physical)', 'Mathematics (Calculus, Coordinate Geometry, Vectors)'],
        strategy: 'JEE relies heavily on mathematical agility and problem-solving speed. Spend 70% of study blocks solving tough numerical problems, and 30% on formula review/theory.',
        weeklyPattern: [
          { day: 'Monday', focus: 'Math: Limits, Continuity & Calculus problem sheets + Physics: Mechanics MCQs' },
          { day: 'Tuesday', focus: 'Chemistry: Organic Reactions mechanism synthesis + Formula flashcard review' },
          { day: 'Wednesday', focus: 'Physics: Electromagnetism concepts + Math: Trigonometry practice' },
          { day: 'Thursday', focus: 'Chemistry: Physical Chemistry numericals (Thermodynamics) + JEE PYQs' },
          { day: 'Friday', focus: 'Math: Coordinate Geometry properties + Chemistry: Inorganic trends' },
          { day: 'Saturday', focus: 'Syllabus Revision: Formula test sheets + Subject-wise short tests' },
          { day: 'Sunday', focus: 'Full JEE Main Mock Test (3 Hours) + Time management error analysis' }
        ],
        tips: [
          "Maintain a dedicated formula book. Review it before sleep daily.",
          "Identify and isolate your weak topics. Don't avoid tough math problems.",
          "Analyze mock tests to check if you lose marks due to calculation errors or conceptual gaps."
        ]
      },
      neet: {
        title: 'NEET (Medical Entrance)',
        subjects: ['Biology (Botany & Zoology NCERT)', 'Chemistry (Organic, Inorganic, Physical)', 'Physics (Mechanics, Optics, Thermodynamics)'],
        strategy: 'NEET is highly competitive with high cutoffs. Biology is scoring; NCERT textbooks must be read line-by-line. Physics requires quick formula application.',
        weeklyPattern: [
          { day: 'Monday', focus: 'Biology: Plant Physiology NCERT line-by-line reading + Zoology MCQs' },
          { day: 'Tuesday', focus: 'Physics: Kinematics & Laws of Motion numericals + formula review' },
          { day: 'Wednesday', focus: 'Chemistry: Organic Hydrocarbons mechanism practice + NCERT questions' },
          { day: 'Thursday', focus: 'Biology: Human Genetics & Evolution key concepts + diagram labeling' },
          { day: 'Friday', focus: 'Chemistry: Coordination compounds + Physics: Modern Physics practice' },
          { day: 'Saturday', focus: 'Quick Biology revision + Formula sheet completion' },
          { day: 'Sunday', focus: 'Full NEET Mock Test (200 Questions, 3 hours) + Biology OMR practice' }
        ],
        tips: [
          "NCERT is the bible for Biology. Review every diagram and summary table multiple times.",
          "Speed is critical. Aim to solve Biology questions in under 30 seconds per question.",
          "Solve at least 150 MCQs daily to build rapid pattern recognition."
        ]
      },
      gre: {
        title: 'GRE / GMAT (Graduate Studies)',
        subjects: ['Quantitative Reasoning (Algebra, Data Analysis)', 'Verbal Reasoning (Vocabulary, Reading Comprehension)', 'Analytical Writing (Issue & Argument Essays)'],
        strategy: 'GRE tests logic, vocabulary, and mathematical traps. Focus on high-frequency vocabulary list repetition and speed-solving quant tricks.',
        weeklyPattern: [
          { day: 'Monday', focus: 'Verbal: Vocabulary list (50 words) + Reading Comprehension passage review' },
          { day: 'Tuesday', focus: 'Quant: Algebra equations, fractions & word problems practice' },
          { day: 'Wednesday', focus: 'Analytical Writing: Issue Essay outline + high-freq words review' },
          { day: 'Thursday', focus: 'Quant: Geometry theorems & Data Interpretation graphs practice' },
          { day: 'Friday', focus: 'Verbal: Text completion questions + Argument Essay writing practice' },
          { day: 'Saturday', focus: 'Vocabulary consolidation + Speed-solving math quizzes' },
          { day: 'Sunday', focus: 'Full GRE Computer-Adaptive Mock Test + Diagnostic error review' }
        ],
        tips: [
          "Learn words in context, not just definitions. Use active recall flashcards.",
          "GRE quant is about traps, not complex math. Check for edge cases like zero, negatives.",
          "Practice writing under strict 30-minute timers to maintain essay structure."
        ]
      },
      gate: {
        title: 'GATE (Engineering Graduate Test)',
        subjects: ['General Aptitude & Reasoning', 'Engineering Mathematics', 'Core Technical Syllabus'],
        strategy: 'GATE evaluates pure technical principles. Engineering Mathematics and General Aptitude make up 28% of total marks and are highly scoring. Study core concepts deeply.',
        weeklyPattern: [
          { day: 'Monday', focus: 'Math: Linear Algebra & Calculus problems + General Aptitude quiz' },
          { day: 'Tuesday', focus: 'Core Technical: Subject 1 (Fundamental laws, derivations & notes)' },
          { day: 'Wednesday', focus: 'Core Technical: Subject 2 (System design, numerical calculations)' },
          { day: 'Thursday', focus: 'Engineering Mathematics: Probability & Differential equations + GATE PYQs' },
          { day: 'Friday', focus: 'Core Technical: Subject 3 (Advanced blocks, troubleshooting)' },
          { day: 'Saturday', focus: 'Combined Core Syllabus Revision + Formula sheet construction' },
          { day: 'Sunday', focus: 'Subject-wise gate test series + formula retention check' }
        ],
        tips: [
          "General Aptitude & Math are low-hanging fruits. Give them daily focus.",
          "Use virtual scientific calculator during mock preparation to get used to GATE interface.",
          "Concept clarity is tested via Numerical Answer Type (NAT) questions where options are not given."
        ]
      },
      custom: {
        title: 'Custom Study Plan',
        subjects: ['Core Concepts Study', 'Practice Questions Bank', 'Weak Areas Revision'],
        strategy: 'Customizable approach to accommodate unique exam structures. Allocate balanced blocks for input (learning) and output (testing).',
        weeklyPattern: [
          { day: 'Monday', focus: 'Topic 1 Concept building + Notes summary creation' },
          { day: 'Tuesday', focus: 'Question bank practice on Topic 1 + Error analysis' },
          { day: 'Wednesday', focus: 'Topic 2 Concept building + Core lectures review' },
          { day: 'Thursday', focus: 'Practice test on Topic 2 + Revision cards creation' },
          { day: 'Friday', focus: 'Targeted study of weak topics identified in tests' },
          { day: 'Saturday', focus: 'Weekly review of all notes and active recall session' },
          { day: 'Sunday', focus: 'Syllabus check-in + Mock Exam / Self-evaluation' }
        ],
        tips: [
          "Maintain a 2:1 ratio between learning (reading/videos) and practice (solving/writing).",
          "Review what you studied within 24 hours to halt the forgetting curve.",
          "Keep your study environment free of phones and social distractions."
        ]
      }
    };
  }

  init() {
    this.loadActivePlan();
    this.registerEvents();
    this.renderActivePlanOnDashboard();
  }

  async loadActivePlan() {
    try {
      const res = await fetch('/api/planner');
      if (res.ok) {
        const plan = await res.json();
        if (plan && plan.examTitle) {
          this.activePlan = plan;
          this.renderActivePlanOnDashboard();
          return;
        }
      }
    } catch (e) {
      console.warn('Java backend offline for active plan, loading local storage:', e);
    }

    const saved = localStorage.getItem('aegis_active_study_plan');
    if (saved) {
      try {
        this.activePlan = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load active plan:', e);
      }
    }
  }

  registerEvents() {
    const btnGen = document.getElementById('planner-btn-generate');
    if (btnGen) {
      btnGen.addEventListener('click', () => this.generatePlan());
    }

    const btnApply = document.getElementById('planner-btn-apply');
    if (btnApply) {
      btnApply.addEventListener('click', () => this.applyPlanToDashboard());
    }
  }

  async generatePlan() {
    const examCode = document.getElementById('planner-exam-select').value;
    const hours = parseInt(document.getElementById('planner-hours-input').value) || 6;
    const timeline = document.getElementById('planner-timeline-select').value;

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examCode: examCode, hours: hours, timeline: timeline })
      });
      if (res.ok) {
        this.proposedPlan = await res.json();
        this.renderSuggestionsBox();
        return;
      }
    } catch (e) {
      console.warn('Java backend offline for planner generate, fallback to local math:', e);
    }

    const sourceSyllabus = this.examSyllabi[examCode];
    if (!sourceSyllabus) return;

    const hoursPerSubject = Math.round((hours * 0.8) * 10) / 10;
    this.proposedPlan = {
      examCode: examCode,
      examTitle: sourceSyllabus.title,
      hoursPerDay: hours,
      timelineMonths: timeline,
      strategy: sourceSyllabus.strategy,
      weeklyPattern: sourceSyllabus.weeklyPattern.map(item => {
        let adjustedFocus = item.focus;
        if (hours >= 10) {
          adjustedFocus += ` (High intensity session: ${hoursPerSubject}h core, 2h revision, 1h testing)`;
        } else if (hours >= 6) {
          adjustedFocus += ` (Standard session: ${hoursPerSubject}h core study, 1.5h question solving)`;
        } else {
          adjustedFocus += ` (Sprint session: 2h focus core, 0.5h micro-test)`;
        }
        return { day: item.day, focus: adjustedFocus };
      }),
      tips: sourceSyllabus.tips,
      generatedAt: new Date().toISOString()
    };

    this.renderSuggestionsBox();
  }

  renderSuggestionsBox() {
    if (!this.proposedPlan) return;
    const weeklyFocusHours = this.proposedPlan.hoursPerDay * 6;
    document.getElementById('suggestions-exam-title').innerText = `${this.proposedPlan.examTitle} Syllabus Suggestion`;
    document.getElementById('suggestions-exam-meta').innerText = `${this.proposedPlan.timelineMonths} Month Timeline | Target: ${this.proposedPlan.hoursPerDay} Hours/Day (${weeklyFocusHours}h/week)`;
    document.getElementById('suggestions-strategy-text').innerText = this.proposedPlan.strategy;

    const listContainer = document.getElementById('suggestions-schedule-list');
    listContainer.innerHTML = '';

    this.proposedPlan.weeklyPattern.forEach(item => {
      const block = document.createElement('div');
      block.className = 'schedule-day-block';
      block.innerHTML = `
        <h4 class="schedule-day-title">${item.day}</h4>
        <p class="schedule-day-task">${item.focus}</p>
      `;
      listContainer.appendChild(block);
    });

    document.getElementById('planner-suggestions-box').style.display = 'block';
    document.getElementById('planner-suggestions-box').scrollIntoView({ behavior: 'smooth' });
  }

  async applyPlanToDashboard() {
    if (!this.proposedPlan) return;
    
    try {
      const res = await fetch('/api/planner/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examCode: this.proposedPlan.examCode,
          hours: this.proposedPlan.hoursPerDay,
          timeline: this.proposedPlan.timelineMonths
        })
      });
      if (res.ok) {
        this.activePlan = await res.json();
      } else {
        this.activePlan = this.proposedPlan;
      }
    } catch (e) {
      console.warn('Java backend apply offline:', e);
      this.activePlan = this.proposedPlan;
    }

    localStorage.setItem('aegis_active_study_plan', JSON.stringify(this.activePlan));
    localStorage.setItem('aegis_target_exam', this.activePlan.examTitle);
    window.dispatchEvent(new CustomEvent('aegis_exam_change', { detail: { exam: this.activePlan.examTitle } }));
    
    this.renderActivePlanOnDashboard();
    alert('Syllabus suggestion schedule successfully applied to your dashboard!');
  }

  renderActivePlanOnDashboard() {
    const titleEl = document.getElementById('dash-active-task-title');
    const container = document.getElementById('dash-weekly-schedule-overview');
    const tipEl = document.getElementById('dash-random-tip');

    if (!this.activePlan) {
      titleEl.innerText = 'Setup Your Daily Plan';
      return;
    }

    titleEl.innerText = `${this.activePlan.examTitle} - Active Weekly Target`;
    
    // Dynamic tip selection
    if (this.activePlan.tips && this.activePlan.tips.length > 0) {
      const idx = Math.floor(Math.random() * this.activePlan.tips.length);
      tipEl.innerText = `"${this.activePlan.tips[idx]}"`;
    }

    // Render list
    container.innerHTML = '';
    
    const table = document.createElement('div');
    table.style.display = 'flex';
    table.style.flexDirection = 'column';
    table.style.gap = '0.75rem';
    table.style.marginTop = '0.5rem';

    this.activePlan.weeklyPattern.forEach(item => {
      // Check current day of week to highlight it
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = days[new Date().getDay()];
      const isToday = item.day === todayName;

      const row = document.createElement('div');
      row.style.padding = '0.75rem';
      row.style.borderRadius = '8px';
      row.style.border = '1px solid var(--border-color)';
      
      if (isToday) {
        row.style.background = 'rgba(99, 102, 241, 0.1)';
        row.style.borderColor = 'rgba(99, 102, 241, 0.35)';
      } else {
        row.style.background = 'rgba(0, 0, 0, 0.15)';
      }

      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.25rem;">
          <strong style="font-size:0.9rem; color: ${isToday ? 'var(--primary)' : 'var(--text-primary)'}">${item.day} ${isToday ? '(Today\'s Target)' : ''}</strong>
          <span style="font-size:0.75rem; color: var(--text-muted)">Active</span>
        </div>
        <div style="font-size:0.85rem; color: var(--text-secondary); line-height: 1.4;">${item.focus}</div>
      `;
      table.appendChild(row);
    });

    container.appendChild(table);
  }
}

// Global Planner instance
const AegisStudyPlanner = new AegisPlanner();
window.AegisStudyPlanner = AegisStudyPlanner;
