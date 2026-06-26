/**
 * storage.js - Local Persistent Document Storage Module
 * Manages client-side IndexedDB for document storage, ensuring offline-first reliability.
 */

class AegisStorageManager {
  constructor() {
    this.dbName = 'AegisPlannerDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // Initialize browser database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        console.error('IndexedDB Error:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      };
    });
  }

  // Retrieve all locally stored documents
  async getDocuments() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (err) => {
        reject(err);
      };
    });
  }

  // Upload (save) document to IndexedDB
  async uploadDocument(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const doc = {
          id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result, // base64 DataURL
          addedAt: new Date().toISOString(),
          isDrive: false
        };

        const transaction = this.db.transaction(['documents'], 'readwrite');
        const store = transaction.objectStore('documents');
        const request = store.put(doc);

        request.onsuccess = () => resolve(doc);
        request.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Delete document by ID
  async deleteDocument(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(false);
      const transaction = this.db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (err) => reject(err);
    });
  }
}

// Global Storage Instance
const AegisStorage = new AegisStorageManager();
window.AegisStorage = AegisStorage;
