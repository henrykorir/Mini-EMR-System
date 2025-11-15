const authService = require('../services/auth.service');

async function handleUserRegistration(request, response) {
  try {
    const { email_address, password, full_name, license_number, role } = request.body;

    if (!email_address || !password || !full_name) {
      return response.status(400).json({
        error: 'Missing required fields: email, password, and full name are mandatory'
      });
    }

    const newUser = await authService.registerClinician({
      email_address,
      password,
      full_name,
      license_number,
      role
    });

    const authToken = authService.generateAuthToken(newUser);

    response.status(201).json({
      success: true,
      message: 'Clinician account created successfully',
      user: {
        user_id: newUser.user_id,
        email_address: newUser.email_address,
        full_name: newUser.full_name,
        role: newUser.role
      },
      access_token: authToken,
      token_type: 'Bearer',
      expires_in: '12 hours'
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    
    if (error.message.includes('already registered')) {
      return response.status(409).json({
        error: 'Account registration failed',
        details: error.message
      });
    }

    response.status(500).json({
      error: 'Account registration service unavailable',
      details: 'Please try again later'
    });
  }
}

async function handleUserLogin(request, response) {
  try {
    const { email_address, password } = request.body;

    if (!email_address || !password) {
      return response.status(400).json({
        error: 'Both email and password are required for authentication'
      });
    }

    const validatedUser = await authService.validateUserCredentials(email_address, password);
    const authToken = authService.generateAuthToken(validatedUser);

    response.json({
      success: true,
      message: 'Authentication successful',
      user: {
        user_id: validatedUser.user_id,
        email_address: validatedUser.email_address,
        full_name: validatedUser.full_name,
        role: validatedUser.role
      },
      access_token: authToken,
      token_type: 'Bearer',
      expires_in: '12 hours'
    });

  } catch (error) {
    console.error('Login error:', error.message);
    
    response.status(401).json({
      error: 'Authentication failed',
      details: 'Invalid email address or password provided'
    });
  }
}

async function handlePasswordChange(request, response) {
  try {
    const userId = request.user.userId;
    const { current_password, new_password } = request.body;

    if (!current_password || !new_password) {
      return response.status(400).json({
        error: 'Both current and new passwords are required'
      });
    }

    await authService.changeUserPassword(userId, current_password, new_password);

    response.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error.message);
    
    if (error.message.includes('incorrect')) {
      return response.status(400).json({
        error: 'Password update failed',
        details: error.message
      });
    }

    response.status(500).json({
      error: 'Password change service unavailable'
    });
  }
}

function validateAuthenticationToken(request, response) {
  response.json({
    authenticated: true,
    user: request.user
  });
}

module.exports = {
  handleUserRegistration,
  handleUserLogin,
  handlePasswordChange,
  validateAuthenticationToken
};