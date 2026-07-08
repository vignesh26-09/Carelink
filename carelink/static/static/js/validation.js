/* ============================================================================
   Form Validation
   ============================================================================ */

class Validator {
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static validatePassword(password) {
    return password && password.length >= 6;
  }

  static validatePhone(phone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.replace(/\D/g, ''));
  }

  static validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('.form-control');
    let isValid = true;

    inputs.forEach(input => {
      const value = input.value.trim();
      const type = input.type;
      const name = input.name;

      if (!value) {
        this.showError(input, 'This field is required');
        isValid = false;
      } else if (type === 'email' && !this.validateEmail(value)) {
        this.showError(input, 'Invalid email address');
        isValid = false;
      } else if (name === 'password' && !this.validatePassword(value)) {
        this.showError(input, 'Password must be at least 6 characters');
        isValid = false;
      } else {
        this.clearError(input);
      }
    });

    return isValid;
  }

  static showError(input, message) {
    input.classList.add('is-invalid');
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('invalid-feedback')) {
      errorEl = document.createElement('div');
      errorEl.className = 'invalid-feedback';
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    errorEl.textContent = message;
  }

  static clearError(input) {
    input.classList.remove('is-invalid');
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains('invalid-feedback')) {
      errorEl.remove();
    }
  }
}
