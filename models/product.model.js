import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Necklaces', 'Bangles', 'Earrings', 'Rings', 'Mangalsutra', 'Combo Sets'] 
  },
  stock: { type: Number, required: true, default: 0 },
  weightGrams: { type: Number, required: true }, // Total weight in grams (e.g., 25.5g)
  platingType: { type: String, default: '1 Gram Gold Plated' }, // e.g., 1 Gram Gold, Micro Plated, Antique Matt
  stoneDetails: { type: String, default: 'None' }, // e.g., American Diamonds (CZ), Kemp Stones, Pearls
 
  // Array of jewelry image URLs
  images: [{ type: String }],seller: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
  // YouTube video showing close-up shine, finish, and flexibility of the jewelry item
  youtubeVideoId: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);