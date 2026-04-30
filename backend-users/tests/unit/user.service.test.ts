/**
 * =============================================================================
 * USER SERVICE UNIT TESTS
 * =============================================================================
 * Tests for user service business logic.
 */

import { generateFakeUsers, hashPassword, comparePassword } from '../../src/services/user.service';

describe('User Service', () => {
  describe('generateFakeUsers', () => {
    it('should generate the requested number of users', async () => {
      const count = 10;
      const users = await generateFakeUsers(count);
      
      expect(users).toHaveLength(count);
    });
    
    it('should generate users with all required fields', async () => {
      const users = await generateFakeUsers(1);
      const user = users[0];
      
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('birthDate');
      expect(user).toHaveProperty('city');
      expect(user).toHaveProperty('country');
      expect(user).toHaveProperty('avatar');
      expect(user).toHaveProperty('company');
      expect(user).toHaveProperty('jobPosition');
      expect(user).toHaveProperty('mobile');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('role');
    });
    
    it('should generate unique emails', async () => {
      const users = await generateFakeUsers(50);
      const emails = users.map(u => u.email);
      const uniqueEmails = new Set(emails);
      
      expect(uniqueEmails.size).toBe(emails.length);
    });
    
    it('should generate unique usernames', async () => {
      const users = await generateFakeUsers(50);
      const usernames = users.map(u => u.username);
      const uniqueUsernames = new Set(usernames);
      
      expect(uniqueUsernames.size).toBe(usernames.length);
    });
    
    it('should generate valid ISO2 country codes', async () => {
      const users = await generateFakeUsers(10);
      
      users.forEach(user => {
        expect(user.country).toMatch(/^[A-Z]{2}$/);
      });
    });
    
    it('should generate passwords between 6 and 10 characters', async () => {
      const users = await generateFakeUsers(20);
      
      users.forEach(user => {
        expect(user.password.length).toBeGreaterThanOrEqual(6);
        expect(user.password.length).toBeLessThanOrEqual(10);
      });
    });
    
    it('should generate valid roles', async () => {
      const users = await generateFakeUsers(20);
      
      users.forEach(user => {
        expect(['admin', 'user']).toContain(user.role);
      });
    });
  });
  
  describe('Password hashing', () => {
    it('should hash passwords', async () => {
      const plainPassword = 'mypassword123';
      const hashed = await hashPassword(plainPassword);
      
      expect(hashed).not.toBe(plainPassword);
      expect(hashed).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });
    
    it('should generate different hashes for same password', async () => {
      const plainPassword = 'mypassword123';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      // Hashes should be different due to different salts
      expect(hash1).not.toBe(hash2);
    });
    
    it('should verify correct passwords', async () => {
      const plainPassword = 'mypassword123';
      const hashed = await hashPassword(plainPassword);
      
      const isValid = await comparePassword(plainPassword, hashed);
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect passwords', async () => {
      const plainPassword = 'mypassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await hashPassword(plainPassword);
      
      const isValid = await comparePassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });
});
