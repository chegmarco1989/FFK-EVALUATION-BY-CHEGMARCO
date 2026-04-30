/**
 * =============================================================================
 * AUTH SERVICE UNIT TESTS
 * =============================================================================
 * Tests for authentication service logic.
 */

import jwt from 'jsonwebtoken';
import { generateAccessToken, verifyToken, hasRole, canAccessProfile } from '../../src/services/auth.service';
import { JwtPayload } from '../../src/types';
import config from '../../src/config/environment';

describe('Auth Service', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload: JwtPayload = {
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
      
      const token = generateAccessToken(payload);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    
    it('should include payload data in token', () => {
      const payload: JwtPayload = {
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
      
      const token = generateAccessToken(payload);
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });
  });
  
  describe('verifyToken', () => {
    it('should verify valid tokens', () => {
      const payload: JwtPayload = {
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
      
      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });
    
    it('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow();
    });
    
    it('should reject tokens with wrong signature', () => {
      const payload: JwtPayload = {
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
      
      // Sign with different secret
      const token = jwt.sign(payload, 'wrong-secret');
      
      expect(() => verifyToken(token)).toThrow();
    });
  });
  
  describe('hasRole', () => {
    it('should allow admin to access admin resources', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
    });
    
    it('should allow admin to access user resources', () => {
      expect(hasRole('admin', 'user')).toBe(true);
    });
    
    it('should allow user to access user resources', () => {
      expect(hasRole('user', 'user')).toBe(true);
    });
    
    it('should not allow user to access admin resources', () => {
      expect(hasRole('user', 'admin')).toBe(false);
    });
  });
  
  describe('canAccessProfile', () => {
    it('should allow admin to access any profile', () => {
      expect(canAccessProfile('admin', 'admin1', 'user1')).toBe(true);
      expect(canAccessProfile('admin', 'admin1', 'user2')).toBe(true);
    });
    
    it('should allow user to access own profile', () => {
      expect(canAccessProfile('user', 'user1', 'user1')).toBe(true);
    });
    
    it('should not allow user to access other profiles', () => {
      expect(canAccessProfile('user', 'user1', 'user2')).toBe(false);
    });
  });
});
