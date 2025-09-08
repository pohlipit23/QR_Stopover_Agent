// Form utility functions for input masking and validation

export const formatCreditCardNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Add spaces every 4 digits
  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  // Limit to 19 characters (16 digits + 3 spaces)
  return formatted.substring(0, 19);
};

export const formatExpiryDate = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Add slash after 2 digits
  if (digits.length >= 2) {
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
  }
  
  return digits;
};

export const formatCVV = (value: string): string => {
  // Remove all non-digit characters and limit to 4 digits
  return value.replace(/\D/g, '').substring(0, 4);
};

export const validateCreditCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and check if it's 16 digits
  const digits = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(digits);
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getCardType = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\s/g, '');
  
  if (digits.startsWith('4')) return 'visa';
  if (digits.startsWith('5') || digits.startsWith('2')) return 'mastercard';
  if (digits.startsWith('3')) return 'amex';
  
  return 'unknown';
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePaymentForm = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (formData.paymentMethod === 'credit-card') {
    if (!formData.cardNumber || !validateCreditCardNumber(formData.cardNumber)) {
      errors.push({ field: 'cardNumber', message: 'Please enter a valid 16-digit card number' });
    }
    
    if (!formData.expiryDate || !validateExpiryDate(formData.expiryDate)) {
      errors.push({ field: 'expiryDate', message: 'Please enter a valid expiry date (MM/YY)' });
    }
    
    if (!formData.cvv || !validateCVV(formData.cvv)) {
      errors.push({ field: 'cvv', message: 'Please enter a valid CVV (3-4 digits)' });
    }
    
    if (!formData.nameOnCard || formData.nameOnCard.trim().length < 2) {
      errors.push({ field: 'nameOnCard', message: 'Please enter the name on the card' });
    }
  }
  
  if (formData.paymentMethod === 'avios') {
    if (!formData.email || !validateEmail(formData.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    if (!formData.password || formData.password.length < 1) {
      errors.push({ field: 'password', message: 'Please enter your password' });
    }
  }
  
  return errors;
};