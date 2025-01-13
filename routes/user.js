const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
const AdminSecret = require('../models/AdminSecret');

dotenv.config();

const router = express.Router();


router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, role, secretKey } = req.body;
  
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      if (role === 'Admin') {
        const predefinedSecretKey = 'qwertykeypad';
        if (secretKey !== predefinedSecretKey) {
          return res.status(401).json({ msg: 'Invalid secret key for Admin' });
        }
      }
  
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
      });
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
  
      await user.save();
  
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          name: `${user.firstName} ${user.lastName}` 
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: payload.user });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });

  router.post('/tasks/assign', async (req, res) => {
    const { task, person, priority, assignedBy } = req.body;
    
    try {
      const newTask = new Task({
        task,
        person,
        priority,
        assignedBy
      });
      await newTask.save();
      res.status(200).json({ msg: 'Task assigned successfully' });
    } catch (error) {
      console.error('Error assigning task:', error);
      res.status(500).send('Server error');
    }
  });
  

  router.get('/users', async (req, res) => {
    try {
      const users = await User.find({ role: { $ne: 'Admin' } });
      const formattedUsers = users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`
      }));
      res.json(formattedUsers);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });

  router.get('/tasks', auth, async (req, res) => {
    const userName = req.user.name;
    
    try {
      const tasks = await Task.find({ person: userName });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).send('Server error');
    }
  });
  
  router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

