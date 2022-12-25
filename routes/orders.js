const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem')
const express = require('express');
const router = express.Router();

// GET Methods
router.get(`/`, async (req, res) =>{
  const orderList = await Order.find().sort({ 'dateOrdered': -1 });
  //.populate('user', 'name')
  if(!orderList) {
    res.status(500).json({ success: false })
  } 
  res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
  const orderList = await Order.findById(req.params.id)
    //.populate('user', 'name')
    //.populate('orderItems')
    .populate({
      path:'orderItems', populate:'product'
    })

  if(!orderList) {
    res.status(500).json({ success: false })
  } 
  res.send(orderList);
})

// POST Methods
router.post(`/`, async (req, res) => {
  const { orderItems, user, status, totalPrice, dateOrdered } = req.body;

  const orderItemsIds = Promise.all(orderItems.map(async (orderItem) => {
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product
    })
    
    newOrderItem = await newOrderItem.save();
    return newOrderItem._id
  }))

  const orderItemsIdsResolved = await orderItemsIds;
  //console.log(orderItemsIdsResolved)
  /*let totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
    const totalPrice = orderItem.product.price * orderItem.quantity
    return totalPrice
  }))

  const totalPrice = totalPrices.reduce((a,b) => a+b, 0)
  console.log(totalPrice)*/

  let order = new Order({ orderItems: orderItemsIdsResolved, user, status, totalPrice, dateOrdered })
  order = await order.save();
  
  if (!order) {
    return res.status(404).send('The order cannot be created')
  }
  res.status(200).send(order);
})

// PUT Methods
router.put(`/:id`, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )

  if (!order) {
    return res.status(400).send('The order cannot be updated')
  }
  res.status(200).send(order);
})

// DELETE Methods
router.delete(`/:id`, (req, res) => {
  Order.findByIdAndRemove(req.params.id).then(async (order) => {
    if (order) {
      await order.orderItems.map(async (orderItem) => {
        await OrderItem.findByIdAndRemove(orderItem)
      })
      return res.status(200).json({
        success: true,
        message: 'The order is deleted'
      })
    } else {
      return res.status(404).json({
        success: false,
        message: 'order not found!'
      })
    }
  }).catch((err) => {
    return res.status(400).json({
      success: false,
      error: err
    })
  })
})

// NEW GET Methods
router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null , totalsales : { $sum : '$totalPrice' } } }
  ])

  if (!totalSales) {
    return res.status(400).send('The order sales cannot be generated')
  }

  res.send({ totalsales: totalSales.pop().totalsales })
})

router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count)

  if (!orderCount) {
    res.status(500).json({success: false})
  } 
  res.send({
    orderCount: orderCount
  });
})

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid }).populate({ 
    path: 'orderItems', populate: {
      path : 'product', populate: 'category'} 
    }).sort({'dateOrdered': -1});

  if(!userOrderList) {
    res.status(500).json({success: false})
  } 
  res.send(userOrderList);
})

module.exports = router;