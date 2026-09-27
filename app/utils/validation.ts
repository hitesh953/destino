/**
 * Validation utility for user data
 * Validates onboarding form inputs before saving to Firestore
 */

export interface OnboardingData {
  name: string;
  dateOfBirth: Date;
  birthTime: Date;
  placeOfBirth: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates user's full name
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || !name.trim()) {
    return { field: 'name', message: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 100) {
    return { field: 'name', message: 'Name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes only
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { field: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return null;
};

/**
 * Validates date of birth
 */
export const validateDateOfBirth = (date: Date): ValidationError | null => {
  if (!date) {
    return { field: 'dateOfBirth', message: 'Date of birth is required' };
  }

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
    return {
      field: 'dateOfBirth',
      message: 'Date of birth cannot be in the future',
    };
  }

  if (age < 13) {
    return {
      field: 'dateOfBirth',
      message: 'You must be at least 13 years old',
    };
  }

  if (age > 150) {
    return {
      field: 'dateOfBirth',
      message: 'Please enter a valid date of birth',
    };
  }

  return null;
};

/**
 * Validates birth time (optional, but if provided must be valid)
 */
export const validateBirthTime = (time: Date | null): ValidationError | null => {
  if (!time) {
    return null; // Birth time is optional
  }

  // Validate that it's a valid time (hours 0-23, minutes 0-59)
  if (time.getHours() < 0 || time.getHours() > 23) {
    return { field: 'birthTime', message: 'Invalid birth time' };
  }

  if (time.getMinutes() < 0 || time.getMinutes() > 59) {
    return { field: 'birthTime', message: 'Invalid birth time' };
  }

  return null;
};

/**
 * Validates place of birth
 */
export const validatePlaceOfBirth = (place: string): ValidationError | null => {
  if (!place || !place.trim()) {
    return { field: 'placeOfBirth', message: 'Place of birth is required' };
  }

  if (place.trim().length < 2) {
    return { field: 'placeOfBirth', message: 'Place of birth must be at least 2 characters' };
  }

  if (place.trim().length > 150) {
    return { field: 'placeOfBirth', message: 'Place of birth must be less than 150 characters' };
  }

  // Allow letters, spaces, hyphens, commas, and apostrophes
  const placeRegex = /^[a-zA-Z\s',\-]+$/;
  if (!placeRegex.test(place)) {
    return { field: 'placeOfBirth', message: 'Place of birth contains invalid characters' };
  }

  return null;
};

/**
 * Validates complete onboarding data
 */
export const validateOnboardingData = (data: OnboardingData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate name
  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  // Validate date of birth
  const dobError = validateDateOfBirth(data.dateOfBirth);
  if (dobError) errors.push(dobError);

  // Validate birth time (optional)
  const timeError = validateBirthTime(data.birthTime);
  if (timeError) errors.push(timeError);

  // Validate place of birth
  const placeError = validatePlaceOfBirth(data.placeOfBirth);
  if (placeError) errors.push(placeError);

  return errors;
};

/**
 * Calculate zodiac sign from date of birth
 */
export const calculateZodiacSign = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};
