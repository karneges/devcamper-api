const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token = '';
  const { authorization = '' } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }
});

exports.authorized = (...role) => {
  return (req, res, next) => {
    const { role: userRole } = req.user;
    if (!role.includes(userRole)) {
      return next(
        new ErrorHandler(
          `User role ${userRole} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
