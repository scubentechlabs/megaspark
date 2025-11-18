// Utility functions for formatting data

export const formatMedium = (medium: string | null | undefined): string => {
  if (!medium) return '';
  
  const mediumLower = medium.toLowerCase();
  
  if (mediumLower === 'gujarati') {
    return 'Gujarati';
  } else if (mediumLower === 'english') {
    return 'English Medium';
  }
  
  // Return original value if it doesn't match known values
  return medium;
};

export const formatRegistrationNumber = (regNumber: string | null | undefined): string => {
  if (!regNumber || regNumber === '') return 'Pending';
  return regNumber;
};
