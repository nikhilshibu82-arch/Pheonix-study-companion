package com.pheonix.handler;

import com.pheonix.model.StudyPlan;
import com.pheonix.service.PlannerService;
import com.pheonix.service.TimerService;
import com.pheonix.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class PlannerHandler implements HttpHandler {
    private final PlannerService plannerService;
    private final TimerService timerService;

    public PlannerHandler(PlannerService plannerService, TimerService timerService) {
        this.plannerService = plannerService;
        this.timerService = timerService;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(method)) {
            StudyPlan active = plannerService.getActivePlan();
            sendResponse(exchange, 200, JsonUtil.toJson(active));
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            if (path.endsWith("/generate")) {
                String examCode = JsonUtil.extractJsonField(body, "examCode");
                Integer hours = JsonUtil.extractJsonInt(body, "hours");
                String timeline = JsonUtil.extractJsonField(body, "timeline");

                if (examCode == null) examCode = "upsc";
                if (hours == null) hours = 6;
                if (timeline == null) timeline = "6";

                StudyPlan plan = plannerService.generatePlan(examCode, hours, timeline);
                sendResponse(exchange, 200, JsonUtil.toJson(plan));
            } else if (path.endsWith("/apply")) {
                String examCode = JsonUtil.extractJsonField(body, "examCode");
                Integer hours = JsonUtil.extractJsonInt(body, "hours");
                String timeline = JsonUtil.extractJsonField(body, "timeline");

                if (examCode == null) examCode = "upsc";
                if (hours == null) hours = 6;
                if (timeline == null) timeline = "6";

                StudyPlan plan = plannerService.generatePlan(examCode, hours, timeline);
                plannerService.setActivePlan(plan);
                timerService.setTargetExam(plan.getExamTitle());

                sendResponse(exchange, 200, JsonUtil.toJson(plan));
            } else {
                sendResponse(exchange, 404, "{\"error\":\"Unknown path\"}");
            }
        } else {
            sendResponse(exchange, 455, "{\"error\":\"Method not allowed\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
