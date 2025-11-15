const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../lib/database');
const { AUTH_CONFIG } = require('../utils/constants');

class AuthenticationService {
  constructor() {
    this.tokenSecret = process.env.JWT_SECRET_KEY || 'clinical_system_secret_2024';
    this.tokenExpiry = '12h';
  }

  async registerClinician(userData) {
    const existingUserCheck = `
      SELECT user_id FROM system_users 
      WHERE email_address = ? AND account_status = 'active'
    `;
    
    const existingUsers = await database.executeQuery(existingUserCheck, [userData.email_address]);
    
    if (existingUsers.length > 0) {
      throw new Error('Email address already registered in the system');
    }

    const passwordSaltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, passwordSaltRounds);

    const insertUserSQL = `
      INSERT INTO system_users 
        (email_address, password_hash, full_name, professional_license, user_role) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const insertionResult = await database.executeQuery(insertUserSQL, [
      userData.email_address,
      hashedPassword,
      userData.full_name,
      userData.license_number || null,
      userData.role || 'physician'
    ]);

    return {
      user_id: insertionResult.insertId,
      email_address: userData.email_address,
      full_name: userData.full_name,
      role: userData.role || 'physician'
    };
  }

  async validateUserCredentials(email, password) {
    const userQuery = `
      SELECT user_id, email_address, password_hash, full_name, user_role, account_status 
      FROM system_users 
      WHERE email_address = ? AND account_status = 'active'
    `;
    
    const userRecords = await database.executeQuery(userQuery, [email]);
    
    if (userRecords.length === 0) {
      throw new Error('Invalid login credentials provided');
    }

    const userRecord = userRecords[0];
    const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid login credentials provided');
    }

    await this.updateLastLogin(userRecord.user_id);

    return {
      user_id: userRecord.user_id,
      email_address: userRecord.email_address,
      full_name: userRecord.full_name,
      role: userRecord.user_role
    };
  }

  async updateLastLogin(userId) {
    const updateSQL = `
      UPDATE system_users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE user_id = ?
    `;
    
    await database.executeQuery(updateSQL, [userId]);
  }

  generateAuthToken(userInfo) {
    const tokenPayload = {
      userId: userInfo.user_id,
      email: userInfo.email_address,
      role: userInfo.role,
      name: userInfo.full_name
    };

    return jwt.sign(tokenPayload, this.tokenSecret, { 
      expiresIn: this.tokenExpiry,
      issuer: 'medi-grind-system',
      audience: 'clinician-portal'
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.tokenSecret, {
        issuer: 'medi-grind-system',
        audience: 'clinician-portal'
      });
    } catch (tokenError) {
      throw new Error('Invalid or expired authentication token');
    }
  }

  async changeUserPassword(userId, currentPassword, newPassword) {
    const userQuery = `
      SELECT password_hash FROM system_users 
      WHERE user_id = ? AND account_status = 'active'
    `;
    
    const userRecords = await database.executeQuery(userQuery, [userId]);
    
    if (userRecords.length === 0) {
      throw new Error('User account not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userRecords[0].password_hash);
    
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    
    const updateSQL = `
      UPDATE system_users 
      SET password_hash = ? 
      WHERE user_id = ?
    `;
    
    await database.executeQuery(updateSQL, [newHashedPassword, userId]);
    
    return true;
  }
}

module.exports = new AuthenticationService();