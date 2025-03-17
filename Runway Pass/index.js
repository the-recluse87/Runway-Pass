const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_CONNECTION

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  suffix: String,
  dob: {
    month: Number,
    day: Number
  },
  password: String
});

const User = mongoose.model('User', userSchema);~

//API Endpoint to Create Account
app.post('/register', async (req, res) => {
  const { firstName, middleName, lastName, suffix, dobMonth, dobDay, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    middleName,
    lastName,
    suffix,
    dob: { month: dobMonth, day: dobDay },
    password: hashedPassword
  });
  await newUser.save();
  res.status(201).send('User registered');
});

//API Endpoint to Create Account
app.post('/login', async (req, res) => {
  const { firstName, lastName, password } = req.body;
  const user = await User.findOne({ firstName, lastName });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'secretKey');
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
