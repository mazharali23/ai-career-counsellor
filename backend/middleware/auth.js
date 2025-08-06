const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid',
      error: error.message
    });
  }
};

module.exports = auth;
