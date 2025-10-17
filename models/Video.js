const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true },      // e.g. "uploads/videos/163234234-abc.mp4"
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);
