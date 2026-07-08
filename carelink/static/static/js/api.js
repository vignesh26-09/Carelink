/* ============================================================================
   API Configuration & HTTP Client
   ============================================================================ */

class APIClient {
  constructor() {
    this.baseURL = 'http://localhost:1327/api';
    this.token = localStorage.getItem('token');
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login.html';
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async register(userData) {
    return this.request('POST', '/auth/register', userData);
  }

  // Doctors
  async getAllDoctors() {
    return this.request('GET', '/doctors');
  }

  async getDoctor(id) {
    return this.request('GET', `/doctors/${id}`);
  }

  // Appointments
  async getAppointments() {
    return this.request('GET', '/appointments');
  }

  async bookAppointment(data) {
    return this.request('POST', '/appointments/book', data);
  }

  async getAppointmentDetails(id) {
    return this.request('GET', `/appointments/${id}`);
  }

  // Schedule
  async getSchedule(doctorId) {
    return this.request('GET', `/schedule/${doctorId}`);
  }

  // Consultation
  async finalizeConsultation(appointmentId, data) {
    return this.request('POST', `/consultation/${appointmentId}/finalize`, data);
  }

  // Admin
  async getAllPatients() {
    return this.request('GET', '/admin/patients');
  }

  async deletePatient(id) {
    return this.request('DELETE', `/admin/patients/${id}`);
  }

  async deleteDoctor(id) {
    return this.request('DELETE', `/doctors/${id}`);
  }
}

const api = new APIClient();
