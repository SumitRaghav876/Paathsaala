import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// level: '9' | '10' | '11' | '12' | 'JEE' (JEE Main) | 'NEET' | 'UPSC'
export const LEVELS = ['9', '10', '11', '12', 'JEE', 'NEET', 'UPSC'];
export const RESOURCE_TYPES = ['book', 'notes', 'paper', 'solution', 'video', 'worksheet', 'other'];

export const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  level: { type: String, default: '10' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  termsAcceptedAt: Date,   // proof that the user agreed at sign-up
  termsVersion: String,
}, { timestamps: true }));

export const Subject = model('Subject', new Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
}));

export const Chapter = model('Chapter', new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  number: Number,
  title: { type: String, required: true },
  notes: String, // your own written notes
}));

// Library item: a LINK to a book, notes, paper, solution or video at its source.
export const Resource = model('Resource', new Schema({
  type: { type: String, enum: RESOURCE_TYPES, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: String,
  level: { type: String, index: true },
  board: { type: String, index: true },        // NCERT, CBSE, NIOS, State board...
  subjectName: { type: String, index: true },
  chapterName: String,
  language: { type: String, default: 'English', index: true },
  provider: { type: String, index: true },     // who hosts/owns it
  year: { type: Number, index: true },
  tags: [String],
  url: String,
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true }));

export const Question = model('Question', new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', index: true },
  type: { type: String, enum: ['mcq', 'short', 'long'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  text: { type: String, required: true },
  options: [String],
  answerIndex: Number,
  answerText: String,
  explanation: String,
  diagramUrl: String,
  year: Number,
}));

export const Attempt = model('Attempt', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  score: Number,
  total: Number,
}, { timestamps: true }));
