const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  offer: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateExpired: {
    type: Date,
    default: ''
  }
})

productSchema.virtual('id').get(function () {
  return this._id.toHexString();
})

productSchema.set('toJSON', {
  virtuals: true,
})
  
exports.Product = mongoose.model('Product', productSchema)