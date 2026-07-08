/* ============================================================================
   Authentication Handler
   ============================================================================ */

class AuthHandler {
  static async login(email, password) {
    try {
      const response = await api.login(email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        api.token = response.token;
        
        // Redirect based on role
        const role = response.user.role;
        if (role === 'PATIENT') {
          window.location.href = '/patient-dashboard.html';
        } else if (role === 'DOCTOR') {
          window.location.href = '/doctor-dashboard.html';
        } else if (role === 'ADMIN') {
          window.location.href = '/admin-dashboard.html';
        }
      }
    } catch (error) {
      Notification.error('Login failed: ' + error.message);
    }
  }

  static async register(userData) {
    try {
      const response = await api.register(userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        api.token = response.token;
        
        Notification.success('Registration successful!');
        window.location.href = '/patient-dashboard.html';
      }
    } catch (error) {
      Notification.error('Registration failed: ' + error.message);
    }
  }

  static logout() {
    localStorage.clear();
    window.location.href = '/index.html';
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}
