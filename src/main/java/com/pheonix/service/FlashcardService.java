package com.pheonix.service;

import com.pheonix.model.Flashcard;
import com.pheonix.model.FlashcardDeck;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class FlashcardService {
    private final List<FlashcardDeck> decks = Collections.synchronizedList(new ArrayList<>());

    public FlashcardService() {
        seedDefaultDecks();
    }

    private void seedDefaultDecks() {
        // Deck 1: UPSC Polity
        List<Flashcard> polityCards = new ArrayList<>();
        polityCards.add(new Flashcard(
            "card_polity_1",
            "What is the \"Basic Structure Doctrine\" and which landmark case established it?",
            "A judicial principle stating that the Parliament cannot amend the core features of the Constitution. Established in Kesavananda Bharati v. State of Kerala (1973).",
            1, null
        ));
        polityCards.add(new Flashcard(
            "card_polity_2",
            "Under which Article can the President declare a Financial Emergency?",
            "Article 360 of the Indian Constitution (Has never been declared in India so far).",
            1, null
        ));
        polityCards.add(new Flashcard(
            "card_polity_3",
            "What rights are guaranteed under Article 21?",
            "Protection of Life and Personal Liberty: \"No person shall be deprived of his life or personal liberty except according to procedure established by law.\"",
            1, null
        ));
        decks.add(new FlashcardDeck("deck_polity", "UPSC Civil Services - Indian Constitution", Instant.now().toString(), polityCards));

        // Deck 2: Organic Chemistry
        List<Flashcard> chemCards = new ArrayList<>();
        chemCards.add(new Flashcard(
            "card_chem_1",
            "Explain Markovnikov's Rule in electrophilic addition.",
            "In the addition of a protic acid HX to an unsymmetrical alkene, the acid hydrogen (H) attaches to the carbon with more hydrogen substituents, and the halide (X) group attaches to the carbon with more alkyl substituents.",
            1, null
        ));
        chemCards.add(new Flashcard(
            "card_chem_2",
            "What is the key difference between SN1 and SN2 reaction kinetics?",
            "SN1 is a unimolecular nucleophilic substitution (two steps, rate depends only on substrate concentration). SN2 is bimolecular nucleophilic substitution (one concerted step, rate depends on both substrate and nucleophile).",
            1, null
        ));
        decks.add(new FlashcardDeck("deck_chem", "JEE/NEET - Organic Chemistry Mechanisms", Instant.now().toString(), chemCards));

        // Deck 3: Aptitude Math
        List<Flashcard> quantCards = new ArrayList<>();
        quantCards.add(new Flashcard(
            "card_quant_1",
            "Formula for finding Compound Interest (CI) compounded half-yearly.",
            "A = P * (1 + R / (2 * 100))^(2n), where CI = Amount (A) - Principal (P), R is annual rate, and n is number of years.",
            1, null
        ));
        quantCards.add(new Flashcard(
            "card_quant_2",
            "Write the formula for the sum of the first \"n\" natural numbers.",
            "Sum = [ n * (n + 1) ] / 2",
            1, null
        ));
        decks.add(new FlashcardDeck("deck_quant", "Quantitative Aptitude - Speed Math Formulae", Instant.now().toString(), quantCards));
    }

    public List<FlashcardDeck> getAllDecks() {
        return new ArrayList<>(decks);
    }

    public FlashcardDeck createDeck(String title) {
        String id = "deck_" + System.currentTimeMillis();
        FlashcardDeck deck = new FlashcardDeck(id, title, Instant.now().toString(), new ArrayList<>());
        decks.add(deck);
        return deck;
    }

    public Flashcard addCardToDeck(String deckId, String front, String back) {
        for (FlashcardDeck deck : decks) {
            if (deck.getId().equals(deckId)) {
                String cardId = "card_" + System.currentTimeMillis();
                Flashcard card = new Flashcard(cardId, front, back, 1, null);
                deck.getCards().add(card);
                return card;
            }
        }
        return null;
    }

    public boolean scoreCard(String deckId, String cardId, int score) {
        for (FlashcardDeck deck : decks) {
            if (deck.getId().equals(deckId)) {
                for (Flashcard card : deck.getCards()) {
                    if (card.getId().equals(cardId)) {
                        // Leitner confidence logic: score 1 = reset, score 5 = master
                        if (score == 1) {
                            card.setConfidence(1);
                        } else if (score == 5) {
                            card.setConfidence(5);
                        } else {
                            card.setConfidence(Math.min(4, card.getConfidence() + 1));
                        }
                        card.setLastReviewed(Instant.now().toString());
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
