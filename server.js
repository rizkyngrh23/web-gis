// Import necessary modules and configure environment variables
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = 5000;
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const users = [];
let refreshTokens = [];

const upload = multer({ dest: 'uploads/' });

// Generate access token
const AccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30m', algorithm: 'HS256' });
};

// Generate refresh token
const RefreshToken = (user) => {
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
  refreshTokens.push(refreshToken);
  return refreshToken;
};

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ fileName: file.originalname, filePath: file.path });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  const user = users.find((user) => user.email === email);

  if (user && await bcrypt.compare(password, user.password)) {
    console.log('Login successful:', user);
    const accessToken = AccessToken({ email: user.email });
    const refreshToken = RefreshToken({ email: user.email });
    res.status(200).send({ user, accessToken, refreshToken });
  } else {
    console.log('Login failed');
    res.status(401).send({ message: 'Login failed' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Register attempt:', { name, email, password });
  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    console.log('User already exists');
    res.status(400).send({ message: 'User already exists' });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, profilePicture: '' };
    users.push(newUser);
    console.log('Registration successful:', newUser);
    const accessToken = AccessToken({ email: newUser.email });
    const refreshToken = RefreshToken({ email: newUser.email });
    res.status(201).send({ user: newUser, accessToken, refreshToken });
  }
});

// Token refresh endpoint
app.post('/api/token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = AccessToken({ email: user.email });
    res.json({ accessToken });
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.sendStatus(204);
});

// Update profile endpoint
app.post('/api.update-profile', (req, res) => {
  const { email, name, profilePicture } = req.body;
  console.log('Update profile attempt:', { email, name, profilePicture });
  const user = users.find((user) => user.email === email);

  if (user) {
    user.name = name;
    user.profilePicture = profilePicture;
    console.log('Profile update successful:', user);
    res.status(200).send(user);
  } else {
    console.log('Profile update failed');
    res.status(404).send({ message: 'User not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
