// utils/validation.ts - Single source of truth for validation
export const ValidationUtils = {
    validateEmail: (email: string): { isValid: boolean; sanitized: string; error?: string } => {
      if (!email || typeof email !== 'string') {
        return { isValid: false, sanitized: '', error: 'Email is required' };
      }
      
      const sanitized = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(sanitized)) {
        return { isValid: false, sanitized, error: 'Invalid email format' };
      }
      
      return { isValid: true, sanitized };
    },
  
    validatePassword: (password: string): { isValid: boolean; error?: string } => {
      if (!password) {
        return { isValid: false, error: 'Password is required' };
      }
      
      if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
      }
      
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        return { isValid: false, error: 'Password must contain letters and numbers' };
      }
      
      return { isValid: true };
    },
  
    validateListTitle: (title: string): { isValid: boolean; sanitized: string; error?: string } => {
      if (!title || typeof title !== 'string') {
        return { isValid: false, sanitized: '', error: 'Title is required' };
      }
      
      // Sanitize input (remove potential XSS)
      const sanitized = title.trim().replace(/[<>]/g, '');
      
      if (sanitized.length === 0) {
        return { isValid: false, sanitized, error: 'Title cannot be empty' };
      }
      
      if (sanitized.length > 100) {
        return { isValid: false, sanitized, error: 'Title must be less than 100 characters' };
      }
      
      return { isValid: true, sanitized };
    },
  
    // General purpose sanitizer
    sanitizeInput: (input: string): string => {
      return input.trim().replace(/[<>]/g, '');
    }
  };
  
  // Security utilities
  export const SecurityUtils = {
    isSecureConnection: (url: string): boolean => {
      return url.startsWith('https://') || __DEV__;
    },
    
    requireSecureConnection: (url: string): void => {
      if (!SecurityUtils.isSecureConnection(url)) {
        throw new Error('Secure connection required');
      }
    }
  };