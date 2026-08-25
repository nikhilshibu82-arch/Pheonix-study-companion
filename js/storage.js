/**
 * storage.js - Local Persistent Document Storage Module
 * Manages client-side IndexedDB for document storage, ensuring offline-first reliability.
 */

class AegisStorageManager {
  constructor() {
    this.apiBase = '/api/documents';
    this.dbName = 'AegisPlannerDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // Initialize storage module
  async init() {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = () => resolve(null);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      };
    });
  }

  // Retrieve documents from Java Backend REST API (with local cache fallback)
  async getDocuments() {
    try {
      const res = await fetch(this.apiBase);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Java Backend offline, falling back to local cache:', e);
    }

    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  // Upload document to Java Backend REST API
  async uploadDocument(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const payload = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result
        };

        try {
          const res = await fetch(this.apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const doc = await res.json();
            return resolve(doc);
          }
        } catch (err) {
          console.warn('Failed to upload to Java backend, writing to local storage:', err);
        }

        // Fallback local write
        const doc = {
          id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result,
          addedAt: new Date().toISOString(),
          isDrive: false
        };

        if (this.db) {
          const tx = this.db.transaction(['documents'], 'readwrite');
          tx.objectStore('documents').put(doc);
        }
        resolve(doc);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Delete document by ID via Java Backend REST API
  async deleteDocument(id) {
    try {
      const res = await fetch(`${this.apiBase}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Failed to delete on Java backend:', e);
    }

    return new Promise((resolve) => {
      if (!this.db) return resolve(false);
      const tx = this.db.transaction(['documents'], 'readwrite');
      const request = tx.objectStore('documents').delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }
}

// Global Storage Instance
const AegisStorage = new AegisStorageManager();
window.AegisStorage = AegisStorage;
