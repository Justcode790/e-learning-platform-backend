const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

function signToken(id, role) {
  const secret = process.env.JWT_SECRET || 'changeme';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const Model = role === 'teacher' ? Teacher : Student;
    const existing = await Model.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await Model.create({ name, email, password: hashed });
    const token = signToken(user._id, role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    console.log(req.body);
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const Model = role === 'teacher' ? Teacher : Student;
    const user = await Model.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user._id, role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const Model = role === 'teacher' ? Teacher : Student;
    const user = await Model.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { ...user.toObject(), role } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };