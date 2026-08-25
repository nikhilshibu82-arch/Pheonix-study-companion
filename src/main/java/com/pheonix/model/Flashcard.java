package com.pheonix.model;

public class Flashcard {
    private String id;
    private String front;
    private String back;
    private int confidence;
    private String lastReviewed;

    public Flashcard() {}

    public Flashcard(String id, String front, String back, int confidence, String lastReviewed) {
        this.id = id;
        this.front = front;
        this.back = back;
        this.confidence = confidence;
        this.lastReviewed = lastReviewed;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFront() { return front; }
    public void setFront(String front) { this.front = front; }

    public String getBack() { return back; }
    public void setBack(String back) { this.back = back; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }

    public String getLastReviewed() { return lastReviewed; }
    public void setLastReviewed(String lastReviewed) { this.lastReviewed = lastReviewed; }
}
