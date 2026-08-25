package com.pheonix.handler;

import com.pheonix.model.UserStats;
import com.pheonix.service.TimerService;
import com.pheonix.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class TimerHandler implements HttpHandler {
    private final TimerService timerService;

    public TimerHandler(TimerService timerService) {
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
            UserStats stats = timerService.getStats();
            sendResponse(exchange, 200, JsonUtil.toJson(stats));
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            if (path.endsWith("/complete")) {
                Integer mins = JsonUtil.extractJsonInt(body, "minutes");
                if (mins != null && mins > 0) {
                    timerService.recordFocusCompletion(mins);
                    sendResponse(exchange, 200, JsonUtil.toJson(timerService.getStats()));
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"Positive minutes integer required\"}");
                }
            } else if (path.endsWith("/spotify")) {
                String playlist = JsonUtil.extractJsonField(body, "playlist");
                if (playlist != null) {
                    timerService.setSpotifyPlaylist(playlist);
                    sendResponse(exchange, 200, JsonUtil.toJson(timerService.getStats()));
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"Playlist URL required\"}");
                }
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
