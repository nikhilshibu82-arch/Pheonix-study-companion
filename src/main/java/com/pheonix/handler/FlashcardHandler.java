package com.pheonix.handler;

import com.pheonix.model.Flashcard;
import com.pheonix.model.FlashcardDeck;
import com.pheonix.service.FlashcardService;
import com.pheonix.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class FlashcardHandler implements HttpHandler {
    private final FlashcardService flashcardService;

    public FlashcardHandler(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(method)) {
            List<FlashcardDeck> decks = flashcardService.getAllDecks();
            sendResponse(exchange, 200, JsonUtil.toJsonDecks(decks));
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            if (path.endsWith("/deck")) {
                String title = JsonUtil.extractJsonField(body, "title");
                if (title != null && !title.isBlank()) {
                    FlashcardDeck deck = flashcardService.createDeck(title);
                    sendResponse(exchange, 201, JsonUtil.toJson(deck));
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"Title required\"}");
                }
            } else if (path.endsWith("/card")) {
                String deckId = JsonUtil.extractJsonField(body, "deckId");
                String front = JsonUtil.extractJsonField(body, "front");
                String back = JsonUtil.extractJsonField(body, "back");

                if (deckId != null && front != null && back != null) {
                    Flashcard card = flashcardService.addCardToDeck(deckId, front, back);
                    sendResponse(exchange, 201, JsonUtil.toJson(card));
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"deckId, front, and back required\"}");
                }
            } else if (path.endsWith("/score")) {
                String deckId = JsonUtil.extractJsonField(body, "deckId");
                String cardId = JsonUtil.extractJsonField(body, "cardId");
                Integer score = JsonUtil.extractJsonInt(body, "score");

                if (deckId != null && cardId != null && score != null) {
                    boolean success = flashcardService.scoreCard(deckId, cardId, score);
                    sendResponse(exchange, 200, "{\"success\":" + success + "}");
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"deckId, cardId, and score required\"}");
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
