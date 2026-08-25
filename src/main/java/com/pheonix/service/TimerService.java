package com.pheonix.service;

import com.pheonix.model.UserStats;

import java.time.LocalDate;

public class TimerService {
    private final UserStats stats = new UserStats();

    public UserStats getStats() {
        return stats;
    }

    public synchronized void recordFocusCompletion(int minutes) {
        stats.setTotalFocusMins(stats.getTotalFocusMins() + minutes);
        updateStreak();
    }

    public synchronized void updateStreak() {
        String today = LocalDate.now().toString();
        if (!today.equals(stats.getLastFocusDate())) {
            stats.setStreakCount(stats.getStreakCount() + 1);
            stats.setLastFocusDate(today);
        }
    }

    public synchronized void setTargetExam(String examTitle) {
        stats.setTargetExam(examTitle);
    }

    public synchronized void setSpotifyPlaylist(String playlistUrl) {
        stats.setSpotifyPlaylist(playlistUrl);
    }
}
