// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
export const isValidPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

// Phone validation (10 digits)
export const isValidPhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''))
}

// Complaint title validation
export const isValidTitle = (title) => {
  return title && title.trim().length >= 5 && title.length <= 200
}

// Description validation
export const isValidDescription = (description) => {
  return description && description.trim().length >= 10 && description.length <= 5000
}

// Validate form data
export const validateComplaintForm = (data) => {
  const errors = {}

  if (!isValidTitle(data.title)) {
    errors.title = 'Title must be 5-200 characters'
  }

  if (!isValidDescription(data.description)) {
    errors.description = 'Description must be 10-5000 characters'
  }

  if (!data.categoryId) {
    errors.categoryId = 'Please select a category'
  }

  if (data.latitude && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = 'Invalid latitude (must be -90 to 90)'
  }

  if (data.longitude && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = 'Invalid longitude (must be -180 to 180)'
  }

  return errors
}

// Validate login form
export const validateLoginForm = (email, password) => {
  const errors = {}

  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}

// Validate register form
export const validateRegisterForm = (data) => {
  const errors = {}

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!isValidPassword(data.password)) {
    errors.password = 'Password must be 8+ chars with uppercase, lowercase, number, and special char'
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Phone must be 10 digits'
  }

  return errors
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
