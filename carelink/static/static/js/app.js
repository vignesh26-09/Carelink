/* ============================================================================
   CARELINK - Main Application
   ============================================================================ */

class CareLink {
  constructor() {
    this.user = null;
    this.token = null;
    this.init();
  }

  init() {
    console.log('🏥 CareLink Application Initialized');
    this.setupEventListeners();
    this.checkAuth();
    this.loadUser();
  }

  setupEventListeners() {
    // Navbar
    document.addEventListener('DOMContentLoaded', () => {
      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');
      
      if (hamburger) {
        hamburger.addEventListener('click', () => {
          navMenu.classList.toggle('show');
        });
      }

      // User dropdown
      const userAvatar = document.querySelector('.user-avatar');
      const dropdownMenu = document.querySelector('.dropdown-menu');
      
      if (userAvatar && dropdownMenu) {
        userAvatar.addEventListener('click', () => {
          dropdownMenu.classList.toggle('show');
        });
      }
    });
  }

  checkAuth() {
    this.token = localStorage.getItem('token');
    if (!this.token && !this.isPublicPage()) {
      window.location.href = '/login.html';
    }
  }

  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }

  isPublicPage() {
    const publicPages = ['login.html', 'register.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    return publicPages.includes(currentPage);
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login.html';
  }
}

// Initialize app
const app = new CareLink();
