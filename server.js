const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage (for demo purposes)
// In production, use a proper database
const pastes = new Map();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a new paste
app.post('/api/paste', (req, res) => {
  try {
    const { content, syntax } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Paste content cannot be empty' });
    }

    const id = uuidv4().substring(0, 8);
    const paste = {
      id,
      content: content.trim(),
      syntax: syntax || 'plaintext',
      createdAt: new Date(),
      views: 0
    };

    pastes.set(id, paste);
    res.json({ id, url: `/paste/${id}` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a paste by ID
app.get('/api/paste/:id', (req, res) => {
  try {
    const { id } = req.params;
    const paste = pastes.get(id);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Increment view count
    paste.views += 1;
    pastes.set(id, paste);

    res.json(paste);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get the paste page
app.get('/paste/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});