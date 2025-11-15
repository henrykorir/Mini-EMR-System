const authService = require('../services/auth.service');

function authenticateToken(request, response, next) {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return response.status(401).json({
      error: 'Authentication required',
      details: 'No authorization token provided'
    });
  }

  try {
    const decodedToken = authService.verifyToken(token);
    request.user = decodedToken;
    next();
  } catch (tokenError) {
    return response.status(403).json({
      error: 'Invalid authentication token',
      details: 'Token is expired or malformed'
    });
  }
}

function requireRole(allowedRoles) {
  return function(request, response, next) {
    if (!request.user) {
      return response.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        error: 'Insufficient permissions',
        details: `Role ${request.user.role} not authorized for this operation`
      });
    }

    next();
  };
}

function validateClinicalAccess(request, response, next) {
  const userRole = request.user.role;
  
  if (userRole !== 'physician' && userRole !== 'nurse') {
    return response.status(403).json({
      error: 'Clinical access required',
      details: 'This operation requires clinical privileges'
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  validateClinicalAccess
};