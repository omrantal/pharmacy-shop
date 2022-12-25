const { User } = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const secret = process.env.secret;

// GET Methods
router.get(`/`, async (req, res) =>{
  const userList = await User.find().select('-passwordHash');

  if(!userList) {
      res.status(500).json({ success: false })
  }
  console.log(userList[0].id);
  res.send(userList);
})

router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  
  if (!user) {
    res.status(500).json({
      message: 'The user with the given ID was not found'
    })
  }
  res.status(200).send(user);
})

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments({});

  if (!userCount) {
    res.status(500).json({ success: true })
  }
  res.send({ userCount });
})

// POST Methods
router.post(`/`, async (req, res) => {
  const { name, email, password, phone, isAdmin, street,
    apartment, zip, city, country } = req.body;

  let user = new User({
    name, email, passwordHash: bcrypt.hashSync(password, 10),
    phone, isAdmin, street, apartment, zip, city, country
  })
  user = await user.save();

  if (!user) {
    return res.status(404).send('The user cannot be created')
  }
  res.status(200).send(user);
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(400).send('The user not found');
  }
  
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      secret,
      { expiresIn: '1d' }
    )
    res.status(200).send({ user: user.email, token })
  } else {
    res.status(400).send('Password is wrong')
  }
})

router.post('/register', async (req,res)=>{
  const { name, email, password, phone, isAdmin, street,
    apartment, zip, city, country } = req.body;

  let user = new User({
    name, email, passwordHash: bcrypt.hashSync(password, 10),
    phone, isAdmin, street, apartment, zip, city, country
  })
  user = await user.save();

  if(!user) {
    res.status(400).send('the user cannot be created!')
  }
  res.send(user);
})

// DELETE Methods
router.delete(`/:id`, (req, res) => {
  User.findByIdAndRemove(req.params.id).then((user) => {
    if (user) {
      return res.status(200).json({
        success: true,
        message: 'The user is deleted'
      })
    } else {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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