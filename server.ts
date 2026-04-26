import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbFile);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API ROUTES
  
  // 1. Get all events
  app.get('/api/events', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Get single event
  app.get('/api/events/:id', (req, res) => {
    try {
      const { id } = req.params;
      const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ error: 'Event not found' });
      res.json(row);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Create new event
  app.post('/api/events', (req, res) => {
    try {
      const { title, date, location, description, capacity } = req.body;
      if (!title || !date || !location || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const info = db.prepare(
        'INSERT INTO events (title, date, location, description, capacity) VALUES (?, ?, ?, ?, ?)'
      ).run(title, date, location, description, capacity);
      
      res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Delete event
  app.delete('/api/events/:id', (req, res) => {
    try {
      const { id } = req.params;
      const info = db.prepare('DELETE FROM events WHERE id = ?').run(id);
      res.json({ success: true, deleted: info.changes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Register for event
  app.post('/api/events/:id/register', (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Check capacity first
      const row: any = db.prepare('SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE event_id = ?) as registered FROM events WHERE id = ?').get(id, id);
      
      if (!row) return res.status(404).json({ error: 'Event not found' });
        
      if (row.registered >= row.capacity) {
        return res.status(400).json({ error: 'Event is at full capacity' });
      }

      const info = db.prepare(
        'INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)'
      ).run(id, name, email);
      
      res.json({ id: info.lastInsertRowid, event_id: id, name, email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Get registrations for an event
  app.get('/api/events/:id/registrations', (req, res) => {
    try {
      const { id } = req.params;
      const rows = db.prepare('SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC').all(id);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
