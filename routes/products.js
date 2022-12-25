const { Product } = require('../models/product');
const { Category } = require('../models/category');
const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type')

    if (isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  },
})

const uploadOptions = multer({ storage: storage })

// GET Methods
router.get(`/`, async (req, res) => {
  let categories = {};
  if (req.query.categories) {
    categories = { category: req.query.categories.split(',') }
  }

  const productList = await Product.find(categories).populate('category')

  if (!productList) {
    res.status(500).json({ success: false })
  }
  res.send(productList);
})

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category')

  if (!product) {
    res.status(500).json({ success: false })
  }
  res.send(product)
})

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments({})

  if (!productCount) {
    res.status(500).json({ success: true })
  }
  res.send({ productCount })
})

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count;
  const products = count
    ? await Product.find({ isFeatured: true }).limit(+count)
    : await Product.find({ isFeatured: true });

  if (!products) {
    res.status(500).json({ success: false })
  }
  res.send(products);
})

// POST Methods
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const { name, category, price, isOffer, offer, isFeatured, dateExpired } = req.body;

  const cate = await Category.findById(category);
  if (!cate) return res.status(400).send('Invalid Category')

  let image = ''
  if (req.file) {
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
    image = `${basePath}${fileName}`
  }
  //if (!file) return res.status(400).send('No image in the request')

  let newProduct = new Product({
    name, image, category, price, isOffer, offer, isFeatured, dateExpired
  })
  //res.send(newProduct)
  newProduct = await newProduct.save();

  if (!newProduct) {
    return res.status(500).send('The product cannot be created')
  }
  res.send(newProduct);
})

// PUT Methods
router.put(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid product ID')
  }

  const cate = await Category.findById(req.body.category)
  if (!cate) return res.status(400).send('Invalid Category')

  const { name, category, price, isOffer, offer, isFeatured, dateExpired } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, category, price, isOffer, offer, isFeatured, dateExpired },
    { new: true }
  )

  if (!product) {
    return res.status(500).send('The product cannot be updated')
  }
  res.status(200).send(product)
})

/*router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product Id')
  }
  const files = req.files
  let imagesPaths = []
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

  if (files) {
    files.map((file) => {
      imagesPaths.push(`${basePath}${file.filename}`)
    })
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { images: imagesPaths },
    { new: true }
  )

  if (!product) return res.status(500).send('the gallery cannot be updated!')

  res.send(product)
})*/

// DELETE Methods
router.delete(`/:id`, (req, res) => {
  Product.findByIdAndRemove(req.params.id).then((product) => {
    if (product) {
      return res.status(200).json({
        success: true,
        message: 'The product is deleted'
      })
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
  }).catch((err) => {
    return res.status(400).json({
      success: false,
      error: err
    })
  })
})

module.exports = router;
