export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
