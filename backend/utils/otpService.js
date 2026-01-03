// backend/utils/otpService.js

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate OTP
 * @param {string} generatedOTP - OTP stored in memory
 * @param {string} userOTP - OTP provided by the user
 * @returns {boolean} true if valid, false otherwise
 */
const validateOTP = (generatedOTP, userOTP) => {
  // Ensure both are strings for comparison
  return String(generatedOTP) === String(userOTP);
};

/**
 * Optional: Generate OTP with expiry (for future use)
 * @param {number} expiryMinutes
 */
const generateOTPWithExpiry = (expiryMinutes = 5) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  return { otp, expiresAt };
};

module.exports = {
  generateOTP,
  validateOTP,
  generateOTPWithExpiry, // optional for future
};
