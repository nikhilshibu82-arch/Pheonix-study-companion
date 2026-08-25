package com.pheonix.service;

import com.pheonix.model.StudyPlan;

import java.time.Instant;
import java.util.*;

public class PlannerService {

    private StudyPlan activePlan = null;

    private static class ExamTemplate {
        String title;
        String strategy;
        List<StudyPlan.DayTask> pattern;
        List<String> tips;

        ExamTemplate(String title, String strategy, List<StudyPlan.DayTask> pattern, List<String> tips) {
            this.title = title;
            this.strategy = strategy;
            this.pattern = pattern;
            this.tips = tips;
        }
    }

    private final Map<String, ExamTemplate> examSyllabi = new HashMap<>();

    public PlannerService() {
        initSyllabi();
    }

    private void initSyllabi() {
        // UPSC
        List<StudyPlan.DayTask> upscPattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Indian Polity & Constitutional Amendments + Daily Newspaper analysis"),
            new StudyPlan.DayTask("Tuesday", "Modern Indian History (Freedom Struggle) + Answer Writing Practice"),
            new StudyPlan.DayTask("Wednesday", "Physical & Human Geography mapping + Daily Editorial review"),
            new StudyPlan.DayTask("Thursday", "Indian Economy basics & Union Budget concepts + MCQ quiz"),
            new StudyPlan.DayTask("Friday", "Environment, Ecology & Climate Change notes + CSAT Aptitude practice"),
            new StudyPlan.DayTask("Saturday", "Comprehensive Weekly Revision of Polity/History + Editorial consolidation"),
            new StudyPlan.DayTask("Sunday", "Full-length GS Sectional Test (3 Hours) + Detailed Error Log Review")
        );
        List<String> upscTips = Arrays.asList(
            "Never skip newspaper analysis. Link current events with basic GS topics.",
            "Write at least one mains answer daily. Content is useless without articulation.",
            "Solve previous year questions (PYQs) repeatedly. They reveal examiner patterns."
        );
        examSyllabi.put("upsc", new ExamTemplate("UPSC Civil Services (IAS/IPS)", "UPSC requires highly conceptual depth, current affairs integration, and writing practice. Divide time: 60% Core GS Subjects, 20% Current Affairs, 20% Mock Revision.", upscPattern, upscTips));

        // JEE
        List<StudyPlan.DayTask> jeePattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Math: Limits, Continuity & Calculus problem sheets + Physics: Mechanics MCQs"),
            new StudyPlan.DayTask("Tuesday", "Chemistry: Organic Reactions mechanism synthesis + Formula flashcard review"),
            new StudyPlan.DayTask("Wednesday", "Physics: Electromagnetism concepts + Math: Trigonometry practice"),
            new StudyPlan.DayTask("Thursday", "Chemistry: Physical Chemistry numericals (Thermodynamics) + JEE PYQs"),
            new StudyPlan.DayTask("Friday", "Math: Coordinate Geometry properties + Chemistry: Inorganic trends"),
            new StudyPlan.DayTask("Saturday", "Syllabus Revision: Formula test sheets + Subject-wise short tests"),
            new StudyPlan.DayTask("Sunday", "Full JEE Main Mock Test (3 Hours) + Time management error analysis")
        );
        List<String> jeeTips = Arrays.asList(
            "Maintain a dedicated formula book. Review it before sleep daily.",
            "Identify and isolate your weak topics. Don't avoid tough math problems.",
            "Analyze mock tests to check if you lose marks due to calculation errors or conceptual gaps."
        );
        examSyllabi.put("jee", new ExamTemplate("JEE Main & Advanced (Engineering)", "JEE relies heavily on mathematical agility and problem-solving speed. Spend 70% of study blocks solving tough numerical problems, and 30% on formula review/theory.", jeePattern, jeeTips));

        // NEET
        List<StudyPlan.DayTask> neetPattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Biology: Plant Physiology NCERT line-by-line reading + Zoology MCQs"),
            new StudyPlan.DayTask("Tuesday", "Physics: Kinematics & Laws of Motion numericals + formula review"),
            new StudyPlan.DayTask("Wednesday", "Chemistry: Organic Hydrocarbons mechanism practice + NCERT questions"),
            new StudyPlan.DayTask("Thursday", "Biology: Human Genetics & Evolution key concepts + diagram labeling"),
            new StudyPlan.DayTask("Friday", "Chemistry: Coordination compounds + Physics: Modern Physics practice"),
            new StudyPlan.DayTask("Saturday", "Quick Biology revision + Formula sheet completion"),
            new StudyPlan.DayTask("Sunday", "Full NEET Mock Test (200 Questions, 3 hours) + Biology OMR practice")
        );
        List<String> neetTips = Arrays.asList(
            "NCERT is the bible for Biology. Review every diagram and summary table multiple times.",
            "Speed is critical. Aim to solve Biology questions in under 30 seconds per question.",
            "Solve at least 150 MCQs daily to build rapid pattern recognition."
        );
        examSyllabi.put("neet", new ExamTemplate("NEET (Medical Entrance)", "NEET is highly competitive with high cutoffs. Biology is scoring; NCERT textbooks must be read line-by-line. Physics requires quick formula application.", neetPattern, neetTips));

        // GRE
        List<StudyPlan.DayTask> grePattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Verbal: Vocabulary list (50 words) + Reading Comprehension passage review"),
            new StudyPlan.DayTask("Tuesday", "Quant: Algebra equations, fractions & word problems practice"),
            new StudyPlan.DayTask("Wednesday", "Analytical Writing: Issue Essay outline + high-freq words review"),
            new StudyPlan.DayTask("Thursday", "Quant: Geometry theorems & Data Interpretation graphs practice"),
            new StudyPlan.DayTask("Friday", "Verbal: Text completion questions + Argument Essay writing practice"),
            new StudyPlan.DayTask("Saturday", "Vocabulary consolidation + Speed-solving math quizzes"),
            new StudyPlan.DayTask("Sunday", "Full GRE Computer-Adaptive Mock Test + Diagnostic error review")
        );
        List<String> greTips = Arrays.asList(
            "Learn words in context, not just definitions. Use active recall flashcards.",
            "GRE quant is about traps, not complex math. Check for edge cases like zero, negatives.",
            "Practice writing under strict 30-minute timers to maintain essay structure."
        );
        examSyllabi.put("gre", new ExamTemplate("GRE / GMAT (Graduate Studies)", "GRE tests logic, vocabulary, and mathematical traps. Focus on high-frequency vocabulary list repetition and speed-solving quant tricks.", grePattern, greTips));

        // GATE
        List<StudyPlan.DayTask> gatePattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Math: Linear Algebra & Calculus problems + General Aptitude quiz"),
            new StudyPlan.DayTask("Tuesday", "Core Technical: Subject 1 (Fundamental laws, derivations & notes)"),
            new StudyPlan.DayTask("Wednesday", "Core Technical: Subject 2 (System design, numerical calculations)"),
            new StudyPlan.DayTask("Thursday", "Engineering Mathematics: Probability & Differential equations + GATE PYQs"),
            new StudyPlan.DayTask("Friday", "Core Technical: Subject 3 (Advanced blocks, troubleshooting)"),
            new StudyPlan.DayTask("Saturday", "Combined Core Syllabus Revision + Formula sheet construction"),
            new StudyPlan.DayTask("Sunday", "Subject-wise gate test series + formula retention check")
        );
        List<String> gateTips = Arrays.asList(
            "General Aptitude & Math are low-hanging fruits. Give them daily focus.",
            "Use virtual scientific calculator during mock preparation to get used to GATE interface.",
            "Concept clarity is tested via Numerical Answer Type (NAT) questions where options are not given."
        );
        examSyllabi.put("gate", new ExamTemplate("GATE (Engineering Graduate Test)", "GATE evaluates pure technical principles. Engineering Mathematics and General Aptitude make up 28% of total marks and are highly scoring. Study core concepts deeply.", gatePattern, gateTips));

        // CUSTOM
        List<StudyPlan.DayTask> customPattern = Arrays.asList(
            new StudyPlan.DayTask("Monday", "Topic 1 Concept building + Notes summary creation"),
            new StudyPlan.DayTask("Tuesday", "Question bank practice on Topic 1 + Error analysis"),
            new StudyPlan.DayTask("Wednesday", "Topic 2 Concept building + Core lectures review"),
            new StudyPlan.DayTask("Thursday", "Practice test on Topic 2 + Revision cards creation"),
            new StudyPlan.DayTask("Friday", "Targeted study of weak topics identified in tests"),
            new StudyPlan.DayTask("Saturday", "Weekly review of all notes and active recall session"),
            new StudyPlan.DayTask("Sunday", "Syllabus check-in + Mock Exam / Self-evaluation")
        );
        List<String> customTips = Arrays.asList(
            "Maintain a 2:1 ratio between learning (reading/videos) and practice (solving/writing).",
            "Review what you studied within 24 hours to halt the forgetting curve.",
            "Keep your study environment free of phones and social distractions."
        );
        examSyllabi.put("custom", new ExamTemplate("Custom Study Plan", "Customizable approach to accommodate unique exam structures. Allocate balanced blocks for input (learning) and output (testing).", customPattern, customTips));
    }

    public StudyPlan generatePlan(String examCode, int hours, String timelineMonths) {
        ExamTemplate template = examSyllabi.get(examCode.toLowerCase());
        if (template == null) {
            template = examSyllabi.get("custom");
        }

        double hoursPerSubject = Math.round((hours * 0.8) * 10.0) / 10.0;

        StudyPlan plan = new StudyPlan();
        plan.setExamCode(examCode);
        plan.setExamTitle(template.title);
        plan.setHoursPerDay(hours);
        plan.setTimelineMonths(timelineMonths);
        plan.setStrategy(template.strategy);
        plan.setTips(new ArrayList<>(template.tips));
        plan.setGeneratedAt(Instant.now().toString());

        List<StudyPlan.DayTask> adjustedPattern = new ArrayList<>();
        for (StudyPlan.DayTask task : template.pattern) {
            String focus = task.getFocus();
            if (hours >= 10) {
                focus += " (High intensity session: " + hoursPerSubject + "h core, 2h revision, 1h testing)";
            } else if (hours >= 6) {
                focus += " (Standard session: " + hoursPerSubject + "h core study, 1.5h question solving)";
            } else {
                focus += " (Sprint session: 2h focus core, 0.5h micro-test)";
            }
            adjustedPattern.add(new StudyPlan.DayTask(task.getDay(), focus));
        }

        plan.setWeeklyPattern(adjustedPattern);
        return plan;
    }

    public void setActivePlan(StudyPlan plan) {
        this.activePlan = plan;
    }

    public StudyPlan getActivePlan() {
        return activePlan;
    }
}
