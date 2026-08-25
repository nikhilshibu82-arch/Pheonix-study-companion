package com.pheonix.model;

import java.util.ArrayList;
import java.util.List;

public class FlashcardDeck {
    private String id;
    private String title;
    private String createdAt;
    private List<Flashcard> cards = new ArrayList<>();

    public FlashcardDeck() {}

    public FlashcardDeck(String id, String title, String createdAt, List<Flashcard> cards) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        if (cards != null) {
            this.cards = cards;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<Flashcard> getCards() { return cards; }
    public void setCards(List<Flashcard> cards) { this.cards = cards; }
}
