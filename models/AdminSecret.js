const mongoose = require('mongoose');

const AdminSecretSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  secretKey: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('AdminSecret', AdminSecretSchema);
