import crypto from 'crypto';

export const generateId = () => {
  return crypto.randomBytes(16).toString('hex');
};
