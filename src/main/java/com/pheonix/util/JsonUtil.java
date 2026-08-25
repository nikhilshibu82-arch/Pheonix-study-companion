package com.pheonix.util;

import com.pheonix.model.Document;
import com.pheonix.model.Flashcard;
import com.pheonix.model.FlashcardDeck;
import com.pheonix.model.StudyPlan;
import com.pheonix.model.UserStats;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JsonUtil {

    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (ch <= 0x1F) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        return sb.toString();
    }

    public static String toJson(Document doc) {
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"type\":\"%s\",\"size\":%d,\"content\":\"%s\",\"addedAt\":\"%s\",\"isDrive\":%b}",
            escape(doc.getId()), escape(doc.getName()), escape(doc.getType()),
            doc.getSize(), escape(doc.getContent()), escape(doc.getAddedAt()), doc.isDrive()
        );
    }

    public static String toJsonDocuments(List<Document> docs) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < docs.size(); i++) {
            sb.append(toJson(docs.get(i)));
            if (i < docs.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public static String toJson(Flashcard card) {
        return String.format(
            "{\"id\":\"%s\",\"front\":\"%s\",\"back\":\"%s\",\"confidence\":%d,\"lastReviewed\":%s}",
            escape(card.getId()), escape(card.getFront()), escape(card.getBack()), card.getConfidence(),
            card.getLastReviewed() == null ? "null" : "\"" + escape(card.getLastReviewed()) + "\""
        );
    }

    public static String toJson(FlashcardDeck deck) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("{\"id\":\"%s\",\"title\":\"%s\",\"createdAt\":\"%s\",\"cards\":[",
            escape(deck.getId()), escape(deck.getTitle()), escape(deck.getCreatedAt())));
        List<Flashcard> cards = deck.getCards();
        for (int i = 0; i < cards.size(); i++) {
            sb.append(toJson(cards.get(i)));
            if (i < cards.size() - 1) sb.append(",");
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String toJsonDecks(List<FlashcardDeck> decks) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < decks.size(); i++) {
            sb.append(toJson(decks.get(i)));
            if (i < decks.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public static String toJson(StudyPlan plan) {
        if (plan == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("{\"examCode\":\"%s\",\"examTitle\":\"%s\",\"hoursPerDay\":%d,\"timelineMonths\":\"%s\",\"strategy\":\"%s\",\"weeklyPattern\":[",
            escape(plan.getExamCode()), escape(plan.getExamTitle()), plan.getHoursPerDay(),
            escape(plan.getTimelineMonths()), escape(plan.getStrategy())));

        List<StudyPlan.DayTask> pattern = plan.getWeeklyPattern();
        for (int i = 0; i < pattern.size(); i++) {
            StudyPlan.DayTask task = pattern.get(i);
            sb.append(String.format("{\"day\":\"%s\",\"focus\":\"%s\"}", escape(task.getDay()), escape(task.getFocus())));
            if (i < pattern.size() - 1) sb.append(",");
        }
        sb.append("],\"tips\":[");

        List<String> tips = plan.getTips();
        for (int i = 0; i < tips.size(); i++) {
            sb.append("\"").append(escape(tips.get(i))).append("\"");
            if (i < tips.size() - 1) sb.append(",");
        }
        sb.append(String.format("],\"generatedAt\":\"%s\"}", escape(plan.getGeneratedAt())));
        return sb.toString();
    }

    public static String toJson(UserStats stats) {
        return String.format(
            "{\"totalFocusMins\":%d,\"streakCount\":%d,\"lastFocusDate\":\"%s\",\"targetExam\":\"%s\",\"spotifyPlaylist\":\"%s\"}",
            stats.getTotalFocusMins(), stats.getStreakCount(), escape(stats.getLastFocusDate()),
            escape(stats.getTargetExam()), escape(stats.getSpotifyPlaylist())
        );
    }

    public static String extractJsonField(String json, String field) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static Integer extractJsonInt(String json, String field) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }
}
