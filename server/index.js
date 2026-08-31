const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'super-secret-key-for-dev';

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Error opening database', err);
  else {
    console.log('Connected to SQLite database.');
    
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )`);

    // Create Slots Table
    db.run(`CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      floor INTEGER,
      status TEXT, -- 'available', 'locked', 'occupied'
      lockedBy INTEGER,
      lockedUntil DATETIME,
      FOREIGN KEY (lockedBy) REFERENCES users(id)
    )`, () => {
      // Seed slots if empty
      db.get('SELECT count(*) as count FROM slots', (err, row) => {
        if (row && row.count === 0) {
          const insert = db.prepare('INSERT INTO slots (id, floor, status) VALUES (?, ?, ?)');
          // Floor 2 slots for testing
          ['F2-22', 'F2-23', 'F2-24', 'F2-25', 'F2-26', 'F2-27', 'F2-28', 'F2-29', 'F2-30', 'F2-31'].forEach(id => {
            // make some locked for demo
            const status = ['F2-23', 'F2-26', 'F2-28'].includes(id) ? 'occupied' : 'available';
            insert.run(id, 2, status);
          });
          insert.finalize();
          console.log('Database seeded with parking slots.');
        }
      });
    });

    // Create Reservations Table
    db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      slotId TEXT,
      carColor TEXT,
      licensePlate TEXT,
      date TEXT,
      time TEXT,
      duration INTEGER,
      totalPrice REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (slotId) REFERENCES slots(id)
    )`);
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// -- AUTH API --

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  const hash = bcrypt.hashSync(password, 8);
  
  db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: this.lastID, email, name, defaultCarColor: null, defaultLicensePlate: null } });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { 
      id: user.id, email: user.email, name: user.name, 
      defaultCarColor: user.defaultCarColor, defaultLicensePlate: user.defaultLicensePlate 
    } });
  });
});

app.get('/api/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, defaultCarColor, defaultLicensePlate FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, defaultCarColor, defaultLicensePlate } = req.body;
  db.run(
    'UPDATE users SET name = ?, defaultCarColor = ?, defaultLicensePlate = ? WHERE id = ?',
    [name, defaultCarColor, defaultLicensePlate, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, user: { id: req.user.id, email: req.user.email, name, defaultCarColor, defaultLicensePlate } });
    }
  );
});

// -- SLOTS API --

// Get all slots, auto-unlocking expired ones
app.get('/api/slots', (req, res) => {
  // Release locks older than 5 minutes
  db.run("UPDATE slots SET status = 'available', lockedBy = NULL, lockedUntil = NULL WHERE status = 'locked' AND lockedUntil < datetime('now')", (err) => {
    if (err) console.error("Error clearing expired locks", err);
    
    db.all('SELECT id, floor, status, lockedBy, lockedUntil FROM slots', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// Lock a slot
app.post('/api/slots/:id/lock', authenticateToken, (req, res) => {
  const slotId = req.params.id;
  const userId = req.user.id;
  
  // Try to lock if available or already locked by this user (to extend time)
  db.run(`
    UPDATE slots 
    SET status = 'locked', lockedBy = ?, lockedUntil = datetime('now', '+5 minutes')
    WHERE id = ? AND (status = 'available' OR (status = 'locked' AND lockedBy = ?))
  `, [userId, slotId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(400).json({ error: 'Slot is not available' });
    res.json({ success: true, message: 'Slot locked for 5 minutes' });
  });
});

// Unlock a slot (if user changes mind before payment)
app.post('/api/slots/:id/unlock', authenticateToken, (req, res) => {
  const slotId = req.params.id;
  const userId = req.user.id;
  
  db.run(`
    UPDATE slots 
    SET status = 'available', lockedBy = NULL, lockedUntil = NULL
    WHERE id = ? AND lockedBy = ? AND status = 'locked'
  `, [slotId, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// -- RESERVATION / PAYMENT API --

app.post('/api/book', authenticateToken, (req, res) => {
  const { slotId, carColor, licensePlate, date, time, duration, totalPrice } = req.body;
  const userId = req.user.id;
  
  // Verify user holds the lock
  db.get('SELECT * FROM slots WHERE id = ? AND lockedBy = ? AND status = ?', [slotId, userId, 'locked'], (err, slot) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!slot) return res.status(400).json({ error: 'Lock expired or invalid slot' });
    
    // Simulate payment processing here (Stripe logic would go here)
    // Assuming payment is successful:
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Mark slot as occupied
      db.run('UPDATE slots SET status = ?, lockedBy = NULL, lockedUntil = NULL WHERE id = ?', ['occupied', slotId]);
      
      // Create reservation ticket
      db.run(`
        INSERT INTO reservations (userId, slotId, carColor, licensePlate, date, time, duration, totalPrice) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, slotId, carColor, licensePlate, date, time, duration, totalPrice], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        db.run('COMMIT');
        res.json({ success: true, ticketId: this.lastID });
      });
    });
  });
});

// Get ticket details
app.get('/api/ticket/:id', authenticateToken, (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  
  db.get(`
    SELECT r.*, s.floor 
    FROM reservations r 
    JOIN slots s ON r.slotId = s.id 
    WHERE r.id = ? AND r.userId = ?
  `, [ticketId, userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Ticket not found' });
    res.json(row);
  });
});

// Get all tickets for user
app.get('/api/my-tickets', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all(`
    SELECT r.*, s.floor 
    FROM reservations r 
    JOIN slots s ON r.slotId = s.id 
    WHERE r.userId = ?
    ORDER BY r.createdAt DESC
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all to serve index.html for React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
