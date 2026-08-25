package com.pheonix.handler;

import com.pheonix.model.Document;
import com.pheonix.service.DocumentService;
import com.pheonix.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class DocumentHandler implements HttpHandler {
    private final DocumentService documentService;

    public DocumentHandler(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(method)) {
            List<Document> docs = documentService.getAllDocuments();
            String json = JsonUtil.toJsonDocuments(docs);
            sendResponse(exchange, 200, json);
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            String name = JsonUtil.extractJsonField(body, "name");
            String type = JsonUtil.extractJsonField(body, "type");
            Integer sizeInt = JsonUtil.extractJsonInt(body, "size");
            String content = JsonUtil.extractJsonField(body, "content");

            long size = sizeInt != null ? sizeInt : (content != null ? content.length() : 0);
            if (name == null) name = "document.pdf";
            if (type == null) type = "application/pdf";

            Document doc = documentService.uploadDocument(name, type, size, content);
            String json = JsonUtil.toJson(doc);
            sendResponse(exchange, 201, json);
        } else if ("DELETE".equalsIgnoreCase(method)) {
            String query = exchange.getRequestURI().getQuery();
            String id = null;
            if (query != null && query.contains("id=")) {
                id = query.split("id=")[1].split("&")[0];
            }
            if (id != null && documentService.deleteDocument(id)) {
                sendResponse(exchange, 200, "{\"success\":true}");
            } else {
                sendResponse(exchange, 404, "{\"error\":\"Document not found\"}");
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
