const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
const path = require('path');
app.use(express.static(__dirname));

const mongoURI = process.env.MONGO_CONNECTION;
const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: {
    day: Number,
    month: Number,
    year: Number
  },
  gender: String,
  country: String,
  address: {
    street1: String,
    city: String,
    state: String,
    zip: String
  },
  phone: String,
  email: String,
  username: String,
  password: String,
  securityQuestions: [
    {
      question: String,
      answer: String
    }
  ]
});

const User = mongoose.model('User', userSchema, 'customer');

// ✅ Register endpoint
app.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    dobDay,
    dobMonth,
    dobYear,
    gender,
    country,
    address1,
    city,
    state,
    zip,
    phone,
    email,
    username,
    password,
    securityQuestion1,
    answer1,
    securityQuestion2,
    answer2
  } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).send('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      dob: { day: dobDay, month: dobMonth, year: dobYear },
      gender,
      country,
      address: { street1: address1, city, state, zip },
      phone,
      email,
      username,
      password: hashedPassword,
      securityQuestions: [
        { question: securityQuestion1, answer: answer1 },
        { question: securityQuestion2, answer: answer2 }
      ]
    });

    await newUser.save();
    res.status(201).send('User registered');
  } catch (err) {
    res.status(500).send('Failed to create user');
  }
});

// ✅ Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, { expiresIn: '1h' });

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).send('Server error during login');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
