// Input Validation Utilities

// Check if a value is a non-empty string
const isNonEmptyString = (value) => {
    return typeof value === 'string' && value.trim() !== '';
};

// Check if a value is a valid email
const isValidEmail = (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
};

// Check if a value is a positive number
const isPositiveNumber = (value) => {
    return typeof value === 'number' && value > 0;
};

// Exporting the validation functions
module.exports = {
    isNonEmptyString,
    isValidEmail,
    isPositiveNumber
};
