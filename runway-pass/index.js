const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/.env' });
const { spawn } = require('child_process');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const path = require('path');
app.use(express.static(__dirname));

const mongoURI = process.env.MONGO_CONNECTION;
const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: 
  {
    day: Number,
    month: Number,
    year: Number
  },
  gender: String,
  country: String,
  address: 
  {
    street1: String,
    city: String,
    state: String,
    zip: String
  },
  phone: String,
  email: String,
  username: String,
  password: String,
  securityQuestions: 
  [
    {
      question: String,
      answer: String
    }
  ]
});

const employeeSchema = new mongoose.Schema({
  employeeID: String,
  employeeLName: String,
  employeeFName: String,
  employeeEmail: String,
  employeePhoneNumber: String,
  airportID: String,
  employeeUsername: String,
  employeePassword: String,
});

const airportSchema = new mongoose.Schema({
  airportID: String,
  airportName: String,
  airportCity: String,
  State: String,
  airportCode: String,
});

const runwayPassSchema = new mongoose.Schema({
  runwayPassID: String,
  departure: String,
  arrival: String,
  date: String,
  flightID: String,
  userFirst: String,
  userLast: String,
  passImage: String,
  userID: String,
});

const Employee = mongoose.model('Employee', employeeSchema, 'employee');

const User = mongoose.model('User', userSchema, 'customer');

const Airport = mongoose.model('Airport', airportSchema, 'airport');

const RunwayPass = mongoose.model('RunwayPass', runwayPassSchema, 'runwayPass');

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
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/employee-login', async (req, res) => {
  const { employeeUsername, employeePassword, employeeID } = req.body;

  try {
    console.log('Employee login attempt:', { employeeUsername, employeeID });

    // Check if the employee exists
    const employee = await Employee.findOne({ employeeUsername, employeeID });
    if (!employee) {
      console.error('Employee not found:', { employeeUsername, employeeID });
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log('Employee found:', employee.employeeUsername);

    // Compare the provided password with the password in the database
    if (employeePassword !== employee.employeePassword) {
      console.error('Password mismatch for employee:', employeeUsername);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Employee login successful:', employeeUsername);

    // Return employee information without generating a token
    res.status(200).json({
      message: 'Employee login successful',
      employee: {
        id: employee._id,
        employeeUsername: employee.employeeUsername,
        employeeID: employee.employeeID,
        employeeFName: employee.employeeFName,
        employeeLName: employee.employeeLName,
        employeeEmail: employee.employeeEmail,
        airportID: employee.airportID,
      },
    });
  } catch (err) {
    console.error('Error during employee login:', err);
    res.status(500).json({ message: 'Server error during employee login' });
  }
});

app.get('/user-info', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      console.error("No token provided.");
      return res.status(401).send('Unauthorized');
  }

  try {
      console.log("Verifying token...");
      const decoded = jwt.verify(token, jwtSecret);
      console.log("Decoded token:", decoded);

      const user = await User.findById(decoded.id);
      if (!user) {
          console.error("User not found for ID:", decoded.id);
          return res.status(404).send('User not found');
      }

      console.log("User found:", user);

      const userInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
      };
      res.status(200).json(userInfo);
  } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).send('Invalid token');
  }
});

// Send confirmation email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/send-confirmation-email', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error("No token provided.");
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(404).send("User not found");
    }

    const { email, firstName } = user;
    const { passes } = req.body;

    if (!passes || passes.length === 0) {
      console.error("No passes provided in request body.");
      return res.status(400).send("No passes provided");
    }

    // Generate HTML for pass details
    const passDetailsHtml = passes.map(pass => `
      <li>
        <strong>Pass ID:</strong> ${pass.runwayPassID}<br>
        <strong>Departure:</strong> ${pass.departure}<br>
        <strong>Arrival:</strong> ${pass.arrival}<br>
        <strong>Date:</strong> ${pass.date}<br>
        <strong>Flight Confirmation:</strong> ${pass.flightID}
      </li>
    `).join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Runway Pass Confirmation Email',
      html: `
        <h1>Hello, ${firstName}!</h1>
        <p>Your Runway Pass purchase has been confirmed.</p>
        <p>Below are your pass details:</p>
        <ul>${passDetailsHtml}</ul>
        <p>Thank you for choosing Southwest Airlines.</p>
      `,
    };

    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    res.status(200).json({ message: "Confirmation email sent successfully" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).send("Failed to send confirmation email");
  }
});

app.get('/airports', async (req, res) => {
  try 
  {
    const airports = await Airport.find({}, { airportCode: 1, airportName: 1, _id: 0 }); 
    res.status(200).json(airports);
  } 
  catch (err) 
  {
    console.error('Error fetching airports:', err);
    res.status(500).json({ message: 'Server error while fetching airports' });
  }
});

app.post('/generate-pass', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, jwtSecret);
    const userID = decoded.id;

    const { name, passes } = req.body;
    if (!name || !passes || !Array.isArray(passes) || passes.length === 0) {
      return res.status(400).send("Missing pass data");
    }

    let createdPasses = [];
    for (const pass of passes) {
      const args = [
        name,
        pass.departure,
        pass.arrival,
        pass.confirmation,
      ];
      const pythonScript = path.join(__dirname, 'makepass.py');

      let passDate;
      if (pass.type === "day of travel") {
        passDate = new Date().toISOString().split('T')[0];
      } else {
        const randomFutureDate = new Date();
        randomFutureDate.setDate(randomFutureDate.getDate() + Math.floor(Math.random() * 30) + 1);
        passDate = randomFutureDate.toISOString().split('T')[0];
      }

      await new Promise((resolve) => {
        const python = spawn('py', [pythonScript, ...args]);
        let base64Image = '';

        python.stdout.on('data', (data) => {
          base64Image += data.toString().trim();
        });

        python.stderr.on('data', (data) => {
          console.error(`makepass.py error: ${data}`);
        });

        python.on('close', async (code) => {
          if (code === 0) {
            try {
              const nameParts = name.trim().split(' ');
              const userFirst = nameParts[0];
              const userLast = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

              const newRunwayPass = new RunwayPass({
                runwayPassID: `RP${Date.now()}`,
                flightID: pass.confirmation,
                departure: pass.departure,
                arrival: pass.arrival,
                date: passDate,
                userFirst: userFirst,
                userLast: userLast,
                passImage: base64Image,
                userID: userID,
              });

              const savedPass = await newRunwayPass.save();
              createdPasses.push(savedPass.toObject());
            } catch (err) {
              console.error("Error storing runway pass:", err);
            }
          }
          resolve();
        });
      });
    }

    if (createdPasses.length > 0) {
      res.status(200).json({ message: "Passes generated successfully", passes: createdPasses });
    } else {
      res.status(500).send("Failed to generate passes");
    }
  } catch (err) {
    console.error("Error verifying token or processing passes:", err);
    res.status(401).send("Invalid token");
  }
});

app.get('/get-user-passes', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, jwtSecret);
    const userID = decoded.id;

    // Fetch all runway passes for the logged-in user
    const passes = await RunwayPass.find({ userID });
    res.status(200).json(passes);
  } catch (err) {
    console.error("Error fetching user passes:", err);
    res.status(500).send("Failed to fetch user passes");
  }
});

app.listen(3000, () => 
{
  console.log('Server is running on localhost:3000');
});
