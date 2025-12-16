import mongoose from 'mongoose';

// Sub-child session schema for nested sessions
const subChildSessionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    default: 25
  },
  audio_urls: {
    hindi: String,
    english: String,
    arabic: String
  },
  image_url: {
    type: String
  },
  materials: [{
    name: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  }],
  order: {
    type: Number,
    default: 1
  }
});

// Child session schema for embedded sessions
const childSessionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image_url: {
    type: String
  },
  price: {
    type: Number,
    default: 0
  },
  original_price: {
    type: Number,
    default: 0
  },
  discount_percentage: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },
  sub_sessions: [subChildSessionSchema]
});

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['anxiety', 'confidence', 'sleep', 'focus', 'healing', 'success']
  },
  // duration: {
  //   type: Number,
  //   default: 25
  // },
  languages: [{
    type: String,
    enum: ['english', 'indian_english', 'hindi', 'arabic', 'tagalog', 'chinese']
  }],
  // audio_urls: {
  //   hindi: String,
  //   english: String,
  //   arabic: String
  // },
  // materials: [{
  //   name: {
  //     type: String,
  //     required: true
  //   },
  //   link: {
  //     type: String,
  //     required: true
  //   }
  // }],
  // preview_url: {
  //   type: String
  // },
  required_plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro']
  },
  image_url: {
    type: String
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  updated_date: {
    type: Date,
    default: Date.now
  },
  created_by_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_by: {
    type: String
  },
  is_sample: {
    type: Boolean,
    default: false
  },
  // Parent-child structure
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  child_sessions: [childSessionSchema]
}, {
  timestamps: true
});

// Update the updated_date on save
sessionSchema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

// Index for faster queries
sessionSchema.index({ category: 1, required_plan: 1 });
sessionSchema.index({ created_by_id: 1 });

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);