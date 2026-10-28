import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  themeMode: { type: String, enum: ['light', 'dark'], default: 'light' },
  primaryAccent: { type: String, default: '#2874f0' }, // Flipkart Blue
  secondaryAccent: { type: String, default: '#ff9f00' } // Flipkart Yellow/Orange
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);