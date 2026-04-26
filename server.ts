import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create MySQL connection pool
// This won't throw immediately, it throws when a connection is actually attempted
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sam',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API ROUTES
  
  // 1. Get all events
  app.get('/api/events', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM events ORDER BY date ASC');
      res.json(rows);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Database connection failed. Please ensure MariaDB/MySQL is running and configured.' });
    }
  });

  // 2. Get single event
  app.get('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
      res.json(rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Create new event
  app.post('/api/events', async (req, res) => {
    try {
      const { title, date, location, description, capacity } = req.body;
      if (!title || !date || !location || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const [result]: any = await pool.execute(
        'INSERT INTO events (title, date, location, description, capacity) VALUES (?, ?, ?, ?, ?)',
        [title, date, location, description, capacity]
      );
      
      res.json({ id: result.insertId, ...req.body });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Delete event
  app.delete('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [result]: any = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
      res.json({ success: true, deleted: result.affectedRows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Register for event
  app.post('/api/events/:id/register', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Check capacity first
      const [rows]: any = await pool.query(
        'SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE event_id = ?) as registered FROM events WHERE id = ?',
        [id, id]
      );
      
      if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
      
      const row = rows[0];
      if (row.registered >= row.capacity) {
        return res.status(400).json({ error: 'Event is at full capacity' });
      }

      const [result]: any = await pool.execute(
        'INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)',
        [id, name, email]
      );
      
      res.json({ id: result.insertId, event_id: id, name, email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Get registrations for an event
  app.get('/api/events/:id/registrations', async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC', [id]);
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
