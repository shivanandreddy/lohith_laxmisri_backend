import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'user', 'customer'], 
    default: 'customer' 
  },
  avatar: { type: String, default: '' },
  themePreference: { type: String, default: "jira-dark" }
}, { timestamps: true });

export default mongoose.model('User', userSchema);