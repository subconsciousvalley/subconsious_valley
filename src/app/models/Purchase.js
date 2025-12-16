import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true
  },
  child_session_id: {
    type: String,
    required: false
  },
  session_title: {
    type: String,
    required: true
  },
  child_session_title: {
    type: String,
    required: false
  },
  user_email: {
    type: String,
    required: true
  },
  user_name: {
    type: String
  },
  amount_paid: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  stripe_payment_intent_id: {
    type: String,
    required: true,
    unique: true
  },
  stripe_checkout_session_id: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    default: 'card'
  },
  transaction_fee: {
    type: Number,
    default: 0
  },
  net_amount: {
    type: Number
  },
  customer_ip: {
    type: String
  },
  billing_address: {
    country: String,
    postal_code: String,
    state: String,
    city: String,
    line1: String,
    line2: String
  },
  payment_details: {
    card_brand: String,
    card_last4: String,
    card_exp_month: Number,
    card_exp_year: Number,
    card_country: String
  },
  purchase_date: {
    type: Date,
    default: Date.now
  },
  access_granted: {
    type: Boolean,
    default: false
  },
  refund_details: {
    refund_id: String,
    refund_amount: Number,
    refund_date: Date,
    refund_reason: String
  },
  error_details: {
    error_code: String,
    error_message: String,
    error_date: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
purchaseSchema.index({ user_email: 1, session_id: 1 });

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);