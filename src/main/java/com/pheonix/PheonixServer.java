package com.pheonix;

import com.pheonix.handler.DocumentHandler;
import com.pheonix.handler.FlashcardHandler;
import com.pheonix.handler.PlannerHandler;
import com.pheonix.handler.TimerHandler;
import com.pheonix.service.DocumentService;
import com.pheonix.service.FlashcardService;
import com.pheonix.service.PlannerService;
import com.pheonix.service.TimerService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class PheonixServer {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Services
        DocumentService documentService = new DocumentService();
        FlashcardService flashcardService = new FlashcardService();
        TimerService timerService = new TimerService();
        PlannerService plannerService = new PlannerService();

        // API REST Contexts
        server.createContext("/api/documents", new DocumentHandler(documentService));
        server.createContext("/api/flashcards", new FlashcardHandler(flashcardService));
        server.createContext("/api/planner", new PlannerHandler(plannerService, timerService));
        server.createContext("/api/timer", new TimerHandler(timerService));

        // Static Asset Handler (serves index.html, style.css, logo.png, js/*)
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null); // default executor
        server.start();

        System.out.println("=================================================");
        System.out.println("  Pheonix-Study Companion Java Backend Started ");
        System.out.println("  Server running at: http://localhost:" + PORT);
        System.out.println("=================================================");
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            if (path.startsWith("/api/")) {
                return; // Let API handlers process
            }

            if ("/".equals(path)) {
                path = "/index.html";
            }

            File file = new File("." + path);
            if (!file.exists() || file.isDirectory()) {
                file = new File("./index.html");
            }

            String contentType = "text/html";
            if (path.endsWith(".css")) {
                contentType = "text/css";
            } else if (path.endsWith(".js")) {
                contentType = "application/javascript";
            } else if (path.endsWith(".png")) {
                contentType = "image/png";
            } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (path.endsWith(".svg")) {
                contentType = "image/svg+xml";
            }

            exchange.getResponseHeaders().add("Content-Type", contentType);
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, file.length());

            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream os = exchange.getResponseBody()) {
                fis.transferTo(os);
            }
        }
    }
}
