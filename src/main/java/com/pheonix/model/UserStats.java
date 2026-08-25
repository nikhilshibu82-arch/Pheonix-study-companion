package com.pheonix.model;

public class UserStats {
    private int totalFocusMins;
    private int streakCount;
    private String lastFocusDate;
    private String targetExam;
    private String spotifyPlaylist;

    public UserStats() {
        this.totalFocusMins = 0;
        this.streakCount = 1;
        this.lastFocusDate = "";
        this.targetExam = "None Selected";
        this.spotifyPlaylist = "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhp7wV7G";
    }

    public int getTotalFocusMins() { return totalFocusMins; }
    public void setTotalFocusMins(int totalFocusMins) { this.totalFocusMins = totalFocusMins; }

    public int getStreakCount() { return streakCount; }
    public void setStreakCount(int streakCount) { this.streakCount = streakCount; }

    public String getLastFocusDate() { return lastFocusDate; }
    public void setLastFocusDate(String lastFocusDate) { this.lastFocusDate = lastFocusDate; }

    public String getTargetExam() { return targetExam; }
    public void setTargetExam(String targetExam) { this.targetExam = targetExam; }

    public String getSpotifyPlaylist() { return spotifyPlaylist; }
    public void setSpotifyPlaylist(String spotifyPlaylist) { this.spotifyPlaylist = spotifyPlaylist; }
}
