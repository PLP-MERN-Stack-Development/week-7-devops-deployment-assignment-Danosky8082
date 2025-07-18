const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
  });
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
} else {
  app.use(morgan('dev'));
}

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const note = new Note({ content: req.body.content });
  await note.save();
  res.status(201).json(note);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Mongo Model
const Note = mongoose.model('Note', new mongoose.Schema({ content: String }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
