package com.pheonix.model;

import java.util.ArrayList;
import java.util.List;

public class StudyPlan {
    public static class DayTask {
        private String day;
        private String focus;

        public DayTask() {}
        public DayTask(String day, String focus) {
            this.day = day;
            this.focus = focus;
        }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public String getFocus() { return focus; }
        public void setFocus(String focus) { this.focus = focus; }
    }

    private String examCode;
    private String examTitle;
    private int hoursPerDay;
    private String timelineMonths;
    private String strategy;
    private List<DayTask> weeklyPattern = new ArrayList<>();
    private List<String> tips = new ArrayList<>();
    private String generatedAt;

    public StudyPlan() {}

    public String getExamCode() { return examCode; }
    public void setExamCode(String examCode) { this.examCode = examCode; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public int getHoursPerDay() { return hoursPerDay; }
    public void setHoursPerDay(int hoursPerDay) { this.hoursPerDay = hoursPerDay; }

    public String getTimelineMonths() { return timelineMonths; }
    public void setTimelineMonths(String timelineMonths) { this.timelineMonths = timelineMonths; }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public List<DayTask> getWeeklyPattern() { return weeklyPattern; }
    public void setWeeklyPattern(List<DayTask> weeklyPattern) { this.weeklyPattern = weeklyPattern; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
}
