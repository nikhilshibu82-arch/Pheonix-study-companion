package com.pheonix.model;

public class Document {
    private String id;
    private String name;
    private String type;
    private long size;
    private String content; // Base64 DataURL
    private String addedAt;
    private boolean isDrive;

    public Document() {}

    public Document(String id, String name, String type, long size, String content, String addedAt, boolean isDrive) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.size = size;
        this.content = content;
        this.addedAt = addedAt;
        this.isDrive = isDrive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAddedAt() { return addedAt; }
    public void setAddedAt(String addedAt) { this.addedAt = addedAt; }

    public boolean isDrive() { return isDrive; }
    public void setDrive(boolean drive) { isDrive = drive; }
}
