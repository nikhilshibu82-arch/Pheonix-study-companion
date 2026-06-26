/**
 * flashcards.js - Interactive Flashcard Decks & Active Recall Study Module
 */

class AegisFlashcards {
  constructor() {
    this.decks = [];
    this.activeDeck = null;
    this.currentSessionCards = [];
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
  }

  init() {
    this.loadDecks();
    this.registerEvents();
    this.renderDecks();
  }

  loadDecks() {
    const saved = localStorage.getItem('aegis_flashcard_decks');
    if (saved) {
      try {
        this.decks = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse flashcards:', e);
      }
    }

    // Seed default study decks if empty (perfect for competitive exam students)
    if (this.decks.length === 0) {
      this.seedDefaultDecks();
    }
  }

  saveDecks() {
    localStorage.setItem('aegis_flashcard_decks', JSON.stringify(this.decks));
    this.renderDecks();
    
    // Dispatch stat count update
    let count = 0;
    this.decks.forEach(d => count += d.cards.length);
    window.dispatchEvent(new CustomEvent('aegis_cards_count_change', { detail: { count: count } }));
  }

  seedDefaultDecks() {
    this.decks = [
      {
        id: 'deck_polity',
        title: 'UPSC Civil Services - Indian Constitution',
        createdAt: new Date().toISOString(),
        cards: [
          {
            id: 'card_polity_1',
            front: 'What is the "Basic Structure Doctrine" and which landmark case established it?',
            back: 'A judicial principle stating that the Parliament cannot amend the core features of the Constitution. Established in Kesavananda Bharati v. State of Kerala (1973).',
            confidence: 1,
            lastReviewed: null
          },
          {
            id: 'card_polity_2',
            front: 'Under which Article can the President declare a Financial Emergency?',
            back: 'Article 360 of the Indian Constitution (Has never been declared in India so far).',
            confidence: 1,
            lastReviewed: null
          },
          {
            id: 'card_polity_3',
            front: 'What rights are guaranteed under Article 21?',
            back: 'Protection of Life and Personal Liberty: "No person shall be deprived of his life or personal liberty except according to procedure established by law."',
            confidence: 1,
            lastReviewed: null
          }
        ]
      },
      {
        id: 'deck_chem',
        title: 'JEE/NEET - Organic Chemistry Mechanisms',
        createdAt: new Date().toISOString(),
        cards: [
          {
            id: 'card_chem_1',
            front: 'Explain Markovnikov\'s Rule in electrophilic addition.',
            back: 'In the addition of a protic acid HX to an unsymmetrical alkene, the acid hydrogen (H) attaches to the carbon with more hydrogen substituents, and the halide (X) group attaches to the carbon with more alkyl substituents.',
            confidence: 1,
            lastReviewed: null
          },
          {
            id: 'card_chem_2',
            front: 'What is the key difference between SN1 and SN2 reaction kinetics?',
            back: 'SN1 is a unimolecular nucleophilic substitution (two steps, rate depends only on substrate concentration). SN2 is bimolecular nucleophilic substitution (one concerted step, rate depends on both substrate and nucleophile).',
            confidence: 1,
            lastReviewed: null
          }
        ]
      },
      {
        id: 'deck_quant',
        title: 'Quantitative Aptitude - Speed Math Formulae',
        createdAt: new Date().toISOString(),
        cards: [
          {
            id: 'card_quant_1',
            front: 'Formula for finding Compound Interest (CI) compounded half-yearly.',
            back: 'A = P * (1 + R / (2 * 100))^(2n), where CI = Amount (A) - Principal (P), R is annual rate, and n is number of years.',
            confidence: 1,
            lastReviewed: null
          },
          {
            id: 'card_quant_2',
            front: 'Write the formula for the sum of the first "n" natural numbers.',
            back: 'Sum = [ n * (n + 1) ] / 2',
            confidence: 1,
            lastReviewed: null
          }
        ]
      }
    ];
    this.saveDecks();
  }

  registerEvents() {
    // 3D Card click to flip
    const cardEl = document.getElementById('study-flashcard');
    cardEl.addEventListener('click', () => this.flipCard());

    // Back to Decks List
    document.getElementById('study-btn-back').addEventListener('click', () => {
      this.exitStudySession();
    });

    // Create Deck Triggers
    const createDeckModal = document.getElementById('create-deck-modal');
    document.getElementById('flashcard-btn-create-deck').addEventListener('click', () => {
      createDeckModal.classList.add('active');
    });
    document.getElementById('create-deck-btn-close').addEventListener('click', () => createDeckModal.classList.remove('active'));
    document.getElementById('create-deck-btn-cancel').addEventListener('click', () => createDeckModal.classList.remove('active'));
    document.getElementById('create-deck-btn-save').addEventListener('click', () => {
      const title = document.getElementById('new-deck-title').value.trim();
      if (title) {
        this.createDeck(title);
        createDeckModal.classList.remove('active');
        document.getElementById('new-deck-title').value = '';
      }
    });

    // Add Card Triggers
    const addCardModal = document.getElementById('add-card-modal');
    document.getElementById('study-btn-add-card').addEventListener('click', () => {
      addCardModal.classList.add('active');
    });
    document.getElementById('add-card-btn-close').addEventListener('click', () => addCardModal.classList.remove('active'));
    document.getElementById('add-card-btn-cancel').addEventListener('click', () => addCardModal.classList.remove('active'));
    document.getElementById('add-card-btn-save').addEventListener('click', () => {
      const front = document.getElementById('new-card-front').value.trim();
      const back = document.getElementById('new-card-back').value.trim();
      if (front && back) {
        this.addCardToActiveDeck(front, back);
        addCardModal.classList.remove('active');
        document.getElementById('new-card-front').value = '';
        document.getElementById('new-card-back').value = '';
      }
    });

    // Confidence / Leitner Scoring buttons
    const feedbackButtons = document.querySelectorAll('#study-feedback-actions button');
    feedbackButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Prevent click bubbling to card scene (which would flip it back)
        e.stopPropagation();
        
        const score = parseInt(btn.getAttribute('data-score')) || 3;
        this.scoreCurrentCard(score);
      });
    });
  }

  renderDecks() {
    const grid = document.getElementById('flashcards-deck-grid');
    grid.innerHTML = '';

    if (this.decks.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No decks created yet. Click "Create New Deck" to get started.</p>';
      return;
    }

    this.decks.forEach(deck => {
      const mastered = deck.cards.filter(c => c.confidence >= 5).length;
      
      const card = document.createElement('div');
      card.className = 'deck-card glass-interactive';
      card.innerHTML = `
        <div>
          <h3 class="deck-title">${deck.title}</h3>
          <span class="deck-count">${deck.cards.length} cards</span>
        </div>
        <div>
          <div class="deck-stats">
            <span>Mastered: ${mastered}/${deck.cards.length}</span>
            <button class="btn btn-primary deck-btn-study" data-id="${deck.id}">Study</button>
          </div>
        </div>
      `;

      // Study button click
      card.querySelector('.deck-btn-study').addEventListener('click', (e) => {
        e.stopPropagation();
        this.startStudySession(deck.id);
      });

      // Let double click or standard click open deck study as well
      card.addEventListener('click', () => {
        this.startStudySession(deck.id);
      });

      grid.appendChild(card);
    });
  }

  createDeck(title) {
    const newDeck = {
      id: 'deck_' + Date.now(),
      title: title,
      createdAt: new Date().toISOString(),
      cards: []
    };
    this.decks.push(newDeck);
    this.saveDecks();
  }

  startStudySession(deckId) {
    this.activeDeck = this.decks.find(d => d.id === deckId);
    if (!this.activeDeck) return;

    if (this.activeDeck.cards.length === 0) {
      alert('This deck has no cards. Add some cards to start studying!');
      this.startAddCardFlowImmediately();
      return;
    }

    // Prepare cards (can sort by lowest confidence level to prioritize weaker items)
    this.currentSessionCards = [...this.activeDeck.cards].sort((a, b) => a.confidence - b.confidence);
    this.currentCardIndex = 0;
    this.isCardFlipped = false;

    // Toggle panels
    document.getElementById('flashcard-home-panel').style.display = 'none';
    document.getElementById('flashcard-study-panel').style.display = 'block';
    
    document.getElementById('study-deck-title').innerText = this.activeDeck.title;

    this.showCard();
  }

  startAddCardFlowImmediately() {
    document.getElementById('add-card-modal').classList.add('active');
  }

  showCard() {
    this.isCardFlipped = false;
    const cardEl = document.getElementById('study-flashcard');
    cardEl.classList.remove('is-flipped');
    
    // Hide rating actions initially
    document.getElementById('study-feedback-actions').style.display = 'none';

    const card = this.currentSessionCards[this.currentCardIndex];
    document.getElementById('study-card-counter').innerText = `${this.currentCardIndex + 1} / ${this.currentSessionCards.length}`;
    
    document.getElementById('study-card-front').innerText = card.front;
    document.getElementById('study-card-back').innerText = card.back;
  }

  flipCard() {
    const cardEl = document.getElementById('study-flashcard');
    this.isCardFlipped = !this.isCardFlipped;
    
    if (this.isCardFlipped) {
      cardEl.classList.add('is-flipped');
      document.getElementById('study-feedback-actions').style.display = 'block';
    } else {
      cardEl.classList.remove('is-flipped');
      document.getElementById('study-feedback-actions').style.display = 'none';
    }
  }

  scoreCurrentCard(score) {
    const activeCard = this.currentSessionCards[this.currentCardIndex];
    
    // Find card reference in global decks structure to preserve state
    const deckIndex = this.decks.findIndex(d => d.id === this.activeDeck.id);
    const cardIndex = this.decks[deckIndex].cards.findIndex(c => c.id === activeCard.id);
    
    if (cardIndex !== -1) {
      // Leitner confidence logic: score 1 = reset, score 3 = keep, score 5 = master
      if (score === 1) {
        this.decks[deckIndex].cards[cardIndex].confidence = 1;
      } else if (score === 5) {
        this.decks[deckIndex].cards[cardIndex].confidence = 5;
      } else {
        this.decks[deckIndex].cards[cardIndex].confidence = Math.min(4, (this.decks[deckIndex].cards[cardIndex].confidence || 1) + 1);
      }
      this.decks[deckIndex].cards[cardIndex].lastReviewed = new Date().toISOString();
      this.saveDecks();
    }

    // Go to next card
    this.currentCardIndex++;
    if (this.currentCardIndex < this.currentSessionCards.length) {
      this.showCard();
    } else {
      alert('Deck study complete! Keep reviewing regularly.');
      this.exitStudySession();
    }
  }

  addCardToActiveDeck(front, back) {
    if (!this.activeDeck) return;
    
    const newCard = {
      id: 'card_' + Date.now(),
      front: front,
      back: back,
      confidence: 1,
      lastReviewed: null
    };

    const deckIndex = this.decks.findIndex(d => d.id === this.activeDeck.id);
    if (deckIndex !== -1) {
      this.decks[deckIndex].cards.push(newCard);
      this.saveDecks();
      
      // Update session tracking if in study loop
      this.currentSessionCards.push(newCard);
      document.getElementById('study-card-counter').innerText = `${this.currentCardIndex + 1} / ${this.currentSessionCards.length}`;
    }
  }

  exitStudySession() {
    this.activeDeck = null;
    document.getElementById('flashcard-home-panel').style.display = 'block';
    document.getElementById('flashcard-study-panel').style.display = 'none';
    this.renderDecks();
  }
}

// Global Flashcards instance
const AegisFlashcardManager = new AegisFlashcards();
window.AegisFlashcardManager = AegisFlashcardManager;
