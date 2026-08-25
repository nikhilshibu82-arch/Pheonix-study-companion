package com.pheonix.service;

import com.pheonix.model.Document;
import com.pheonix.util.JsonUtil;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class DocumentService {
    private final List<Document> documents = Collections.synchronizedList(new ArrayList<>());

    public List<Document> getAllDocuments() {
        return new ArrayList<>(documents);
    }

    public Document uploadDocument(String name, String type, long size, String content) {
        String id = "local_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
        String addedAt = Instant.now().toString();

        Document doc = new Document(id, name, type, size, content, addedAt, false);
        documents.add(doc);
        return doc;
    }

    public boolean deleteDocument(String id) {
        return documents.removeIf(d -> d.getId().equals(id));
    }
}
