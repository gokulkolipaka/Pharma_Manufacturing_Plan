// Application State Management
class PharmaPlanningApp {
  constructor() {
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.charts = {};
    this.currentEditingCell = null;
    this.initializeApp();
  }

  initializeApp() {
    this.initializeData();
    this.bindEvents();
    this.checkAuthState();
  }

  initializeData() {
    // Initialize sample data if not exists
    if (!localStorage.getItem('pharma_users')) {
      const sampleUsers = [
        {"id": 1, "username": "superadmin", "email": "super@pharma.com", "role": "superadmin", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()},
        {"id": 2, "username": "admin1", "email": "admin@pharma.com", "role": "admin", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()},
        {"id": 3, "username": "user1", "email": "user@pharma.com", "role": "user", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()}
      ];

      const sampleCompany = {
        "name": "PharmaCorp Manufacturing",
        "logoUrl": ""
      };

      const sampleMaterials = [
        {"id": 1, "name": "Active Ingredient A", "currentStock": 500, "minimumStock": 100, "unit": "kg", "lastUpdated": new Date().toISOString()},
        {"id": 2, "name": "Excipient B", "currentStock": 50, "minimumStock": 150, "unit": "kg", "lastUpdated": new Date().toISOString()},
        {"id": 3, "name": "Coating Material", "currentStock": 200, "minimumStock": 80, "unit": "kg", "lastUpdated": new Date().toISOString()}
      ];

      const sampleEquipment = [
        {"id": 1, "name": "Tablet Press 1", "type": "Manufacturing", "status": "Available", "location": "Production Floor A"},
        {"id": 2, "name": "Coating Machine", "type": "Manufacturing", "status": "Available", "location": "Production Floor B"},
        {"id": 3, "name": "Blender Unit 1", "type": "Mixing", "status": "Maintenance", "location": "Production Floor A"},
        {"id": 4, "name": "Granulator", "type": "Processing", "status": "Available", "location": "Production Floor A"},
        {"id": 5, "name": "Capsule Filler", "type": "Manufacturing", "status": "In Use", "location": "Production Floor C"}
      ];

      const sampleProductionPlans = [
        {"id": 1, "drugName": "Aspirin 100mg", "quantity": 10000, "month": "March", "year": 2025, "status": "Planned", "requestedBy": "BD Team", "createdDate": new Date().toISOString()},
        {"id": 2, "drugName": "Vitamin C 500mg", "quantity": 5000, "month": "March", "year": 2025, "status": "In Progress", "requestedBy": "BD Team", "createdDate": new Date().toISOString()},
        {"id": 3, "drugName": "Paracetamol 500mg", "quantity": 8000, "month": "April", "year": 2025, "status": "Planned", "requestedBy": "BD Team", "createdDate": new Date().toISOString()},
        {"id": 4, "drugName": "Ibuprofen 200mg", "quantity": 12000, "month": "May", "year": 2025, "status": "Planned", "requestedBy": "BD Team", "createdDate": new Date().toISOString()}
      ];

      localStorage.setItem('pharma_users', JSON.stringify(sampleUsers));
      localStorage.setItem('pharma_company', JSON.stringify(sampleCompany));
      localStorage.setItem('pharma_materials', JSON.stringify(sampleMaterials));
      localStorage.setItem('pharma_equipment', JSON.stringify(sampleEquipment));
      localStorage.setItem('pharma_production_plans', JSON.stringify(sampleProductionPlans));
      localStorage.setItem('pharma_calendar', JSON.stringify([]));
      localStorage.setItem('pharma_alerts', JSON.stringify([]));
    }
  }

  bindEvents() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.attachEventListeners();
      });
    } else {
      this.attachEventListeners();
    }
  }

  attachEventListeners() {
    // Authentication Events
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    const passwordChangeForm = document.getElementById('password-change-form');
    if (passwordChangeForm) {
      passwordChangeForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });

    // Company Management
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoPlaceholder) {
      logoPlaceholder.addEventListener('click', () => {
        const logoUpload = document.getElementById('logo-upload');
        if (logoUpload) logoUpload.click();
      });
    }

    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
      logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));
    }

    const companyName = document.getElementById('company-name');
    if (companyName) {
      companyName.addEventListener('click', () => this.enableCompanyNameEdit());
    }

    const companyNameInput = document.getElementById('company-name-input');
    if (companyNameInput) {
      companyNameInput.addEventListener('blur', () => this.saveCompanyName());
      companyNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.saveCompanyName();
      });
    }

    // Production Planning
    const addProductionBtn = document.getElementById('add-production-btn');
    if (addProductionBtn) {
      addProductionBtn.addEventListener('click', () => this.showModal('add-production-modal'));
    }

    const addProductionForm = document.getElementById('add-production-form');
    if (addProductionForm) {
      addProductionForm.addEventListener('submit', (e) => this.handleAddProduction(e));
    }

    // Calendar Navigation - FIXED BUG
    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    }

    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    }

    // Equipment Management
    const addEquipmentCalendarBtn = document.getElementById('add-equipment-calendar');
    if (addEquipmentCalendarBtn) {
      addEquipmentCalendarBtn.addEventListener('click', () => this.openEquipmentModal());
    }

    const calendarEditForm = document.getElementById('calendar-edit-form');
    if (calendarEditForm) {
      calendarEditForm.addEventListener('submit', (e) => this.handleCalendarEdit(e));
    }

    const clearScheduleBtn = document.getElementById('clear-schedule');
    if (clearScheduleBtn) {
      clearScheduleBtn.addEventListener('click', () => this.clearSchedule());
    }

    // Stock Management
    const addMaterialBtn = document.getElementById('add-material-btn');
    if (addMaterialBtn) {
      addMaterialBtn.addEventListener('click', () => this.showModal('add-material-modal'));
    }

    const uploadStockBtn = document.getElementById('upload-stock-btn');
    if (uploadStockBtn) {
      uploadStockBtn.addEventListener('click', () => {
        const excelUpload = document.getElementById('excel-upload');
        if (excelUpload) excelUpload.click();
      });
    }

    const excelUpload = document.getElementById('excel-upload');
    if (excelUpload) {
      excelUpload.addEventListener('change', (e) => this.handleExcelUpload(e));
    }

    const addMaterialForm = document.getElementById('add-material-form');
    if (addMaterialForm) {
      addMaterialForm.addEventListener('submit', (e) => this.handleAddMaterial(e));
    }

    // Reports
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportToCSV());
    }

    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportToPDF());
    }

    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) {
      printReportBtn.addEventListener('click', () => window.print());
    }

    // User Management
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => this.showModal('add-user-modal'));
    }

    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
    }

    // Modal Events
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.hideModal(modal.id);
        }
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.hideModal(modal.id);
        }
      });
    });

    // Equipment Form
    const equipmentForm = document.getElementById('equipment-form');
    if (equipmentForm) {
      equipmentForm.addEventListener('submit', (e) => this.handleEquipmentSubmit(e));
    }

    // Dashboard Settings Form
    const dashboardSettingsForm = document.getElementById('dashboard-settings-form');
    if (dashboardSettingsForm) {
      dashboardSettingsForm.addEventListener('submit', (e) => this.handleDashboardSettings(e));
    }

    // Dashboard card click events for data info
    document.querySelectorAll('.clickable-card').forEach(card => {
      card.addEventListener('click', (e) => this.showDataInfo(e.currentTarget));
    });
  }

  checkAuthState() {
    const savedUser = localStorage.getItem('pharma_current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.showMainApp();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('pharma_current_user');
        this.showLoginScreen();
      }
    } else {
      this.showLoginScreen();
    }
  }

  // Authentication Methods
  handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      this.showToast('Please enter both username and password', 'error');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        this.currentUser = user;
        localStorage.setItem('pharma_current_user', JSON.stringify(user));

        if (user.mustChangePassword) {
          this.showToast('Login successful! Please change your password.', 'success');
          setTimeout(() => {
            this.showModal('password-change-modal');
          }, 500);
        } else {
          this.showToast('Login successful!', 'success');
          setTimeout(() => {
            this.showMainApp();
          }, 500);
        }
      } else {
        this.showToast('Invalid username or password', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showToast('Login failed. Please try again.', 'error');
    }
  }

  handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    if (!username || !email || !password) {
      this.showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');

      if (users.find(u => u.username === username)) {
        this.showToast('Username already exists', 'error');
        return;
      }

      if (users.find(u => u.email === email)) {
        this.showToast('Email already exists', 'error');
        return;
      }

      const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        role,
        mustChangePassword: true,
        createdDate: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('pharma_users', JSON.stringify(users));

      this.showToast('Account created successfully! Please login.', 'success');
      this.switchTab('login');
      document.getElementById('signup-form').reset();
    } catch (error) {
      console.error('Signup error:', error);
      this.showToast('Signup failed. Please try again.', 'error');
    }
  }

  handlePasswordChange(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      this.showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
      const userIndex = users.findIndex(u => u.id === this.currentUser.id);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        users[userIndex].mustChangePassword = false;
        localStorage.setItem('pharma_users', JSON.stringify(users));

        this.currentUser = users[userIndex];
        localStorage.setItem('pharma_current_user', JSON.stringify(this.currentUser));

        this.hideModal('password-change-modal');
        this.showToast('Password changed successfully!', 'success');
        setTimeout(() => {
          this.showMainApp();
        }, 500);
      }
    } catch (error) {
      console.error('Password change error:', error);
      this.showToast('Password change failed. Please try again.', 'error');
    }
  }

  handleLogout() {
    localStorage.removeItem('pharma_current_user');
    this.currentUser = null;
    this.showLoginScreen();
    this.showToast('Logged out successfully', 'info');
  }

  // UI Management - FIXED LOGIN SCREEN BUG
  showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');

    if (loginScreen) {
      loginScreen.classList.remove('hidden');
    }
    if (mainApp) {
      mainApp.classList.add('hidden');
    }
  }

  showMainApp() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');

    if (loginScreen) {
      loginScreen.classList.add('hidden');
    }
    if (mainApp) {
      mainApp.classList.remove('hidden');
    }

    this.updateUserInterface();
    setTimeout(() => {
      this.loadDashboard();
      this.renderEquipmentPanel();
      this.renderDashboardCustomizeBtn();
    }, 100);
  }

  updateUserInterface() {
    const userWelcome = document.getElementById('user-welcome');
    if (userWelcome && this.currentUser) {
      userWelcome.textContent = `Welcome, ${this.currentUser.username}`;
    }

    // Show/hide admin-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      if (this.currentUser && (this.currentUser.role === 'superadmin' || this.currentUser.role === 'admin')) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    // Show/hide superadmin-only elements
    const superadminElements = document.querySelectorAll('.superadmin-only');
    superadminElements.forEach(el => {
      if (this.currentUser && this.currentUser.role === 'superadmin') {
        el.style.display = 'inline';
      } else {
        el.style.display = 'none';
      }
    });

    // Load company info
    try {
      const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
      const companyNameEl = document.getElementById('company-name');
      if (companyNameEl) {
        companyNameEl.textContent = company.name || 'PharmaCorp Manufacturing';
      }

      if (company.logoUrl) {
        const logoEl = document.getElementById('company-logo');
        const placeholderEl = document.querySelector('.logo-placeholder');
        if (logoEl && placeholderEl) {
          logoEl.src = company.logoUrl;
          logoEl.style.display = 'block';
          placeholderEl.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
    const tabForm = document.getElementById(`${tab}-form`);

    if (tabBtn) tabBtn.classList.add('active');
    if (tabForm) tabForm.classList.add('active');
  }

  switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    const navBtn = document.querySelector(`[data-view="${view}"]`);
    const viewEl = document.getElementById(`${view}-view`);

    if (navBtn) navBtn.classList.add('active');
    if (viewEl) viewEl.classList.add('active');

    this.currentView = view;
    this.loadViewData(view);
  }

  loadViewData(view) {
    switch(view) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'production':
        this.loadProductionPlans();
        break;
      case 'calendar':
        this.loadCalendar();
        break;
      case 'stock':
        this.loadStockManagement();
        break;
      case 'reports':
        this.loadReports();
        break;
      case 'users':
        this.loadUserManagement();
        break;
    }
  }

  // Dashboard Methods - ENHANCED WITH DATA INFO
  loadDashboard() {
    try {
      // Apply dashboard customization settings
      this.renderDashboardCustomizeBtn();
      const settings = JSON.parse(localStorage.getItem('dashboard_settings') ||
        '{"showProductionTrend":true,"showUtilization":true,"showStockAlerts":true}');

      // Show/hide dashboard cards based on settings
      const productionCard = document.getElementById('production-trend-card');
      const utilizationCard = document.getElementById('utilization-card');
      const stockAlertsCard = document.getElementById('stock-alerts-card');

      if (productionCard) productionCard.style.display = settings.showProductionTrend ? '' : 'none';
      if (utilizationCard) utilizationCard.style.display = settings.showUtilization ? '' : 'none';
      if (stockAlertsCard) stockAlertsCard.style.display = settings.showStockAlerts ? '' : 'none';

      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
      const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
      const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

      // Update stats
      const totalProduction = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
      const totalProductionEl = document.getElementById('total-production');
      if (totalProductionEl) {
        totalProductionEl.textContent = totalProduction.toLocaleString();
      }

      const availableEquipment = equipment.filter(eq => eq.status === 'Available').length;
      const busyEquipment = equipment.filter(eq => eq.status === 'In Use').length;
      const maintenanceEquipment = equipment.filter(eq => eq.status === 'Maintenance').length;

      const availableEl = document.getElementById('available-equipment');
      const busyEl = document.getElementById('busy-equipment');
      const maintenanceEl = document.getElementById('maintenance-equipment');

      if (availableEl) availableEl.textContent = availableEquipment;
      if (busyEl) busyEl.textContent = busyEquipment;
      if (maintenanceEl) maintenanceEl.textContent = maintenanceEquipment;

      // Stock alerts
      const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
      const alertsContainer = document.getElementById('stock-alerts');
      if (alertsContainer) {
        alertsContainer.innerHTML = '';
        if (lowStockMaterials.length === 0) {
          alertsContainer.innerHTML = '<p>No stock alerts</p>';
        } else {
          lowStockMaterials.forEach(material => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.textContent = `Low stock: ${material.name} (${material.currentStock} ${material.unit} remaining)`;
            alertsContainer.appendChild(alertDiv);
          });
        }
      }

      // Load charts
      setTimeout(() => {
        this.loadProductionChart();
        this.loadAnalyticsChart();
      }, 200);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showToast('Error loading dashboard data', 'error');
    }
  }

  // FIXED: Production Chart - Now shows proper histogram
  loadProductionChart() {
    try {
      const ctx = document.getElementById('production-chart');
      if (!ctx) return;

      const chartCtx = ctx.getContext('2d');
      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');

      // Create histogram data by month
      const monthlyData = {};
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Initialize current month data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthKey = `${monthNames[currentMonth]} ${currentYear}`;

      productionPlans.forEach(plan => {
        const monthIndex = monthNames.findIndex(m => m === plan.month.substring(0, 3));
        const key = `${monthNames[monthIndex] || plan.month.substring(0, 3)} ${plan.year}`;
        monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
      });

      // Ensure current month is included even if no data
      if (!monthlyData[currentMonthKey]) {
        monthlyData[currentMonthKey] = 0;
      }

      const labels = Object.keys(monthlyData).length > 0 ? Object.keys(monthlyData) : [currentMonthKey];
      const data = Object.values(monthlyData).length > 0 ? Object.values(monthlyData) : [0];

      if (this.charts.production) {
        this.charts.production.destroy();
      }

      this.charts.production = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Production Units',
            data: data,
            backgroundColor: 'rgba(33, 128, 141, 0.6)',
            borderColor: 'rgba(33, 128, 141, 1)',
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              callbacks: {
                label: function(context) {
                  return `Units: ${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          elements: {
            bar: {
              borderWidth: 2
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading production chart:', error);
    }
  }

  // Analytics Chart
  loadAnalyticsChart() {
    try {
      const ctx = document.getElementById('analytics-chart');
      if (!ctx) return;

      const chartCtx = ctx.getContext('2d');
      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');

      // Create monthly trend data
      const monthlyData = {};
      productionPlans.forEach(plan => {
        const key = `${plan.month} ${plan.year}`;
        monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
      });

      const labels = Object.keys(monthlyData);
      const data = Object.values(monthlyData);

      if (this.charts.analytics) {
        this.charts.analytics.destroy();
      }

      this.charts.analytics = new Chart(chartCtx, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['March 2025'],
          datasets: [{
            label: 'Production Trend',
            data: data.length > 0 ? data : [15000],
            borderColor: 'rgba(33, 128, 141, 1)',
            backgroundColor: 'rgba(33, 128, 141, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(33, 128, 141, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString();
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading analytics chart:', error);
    }
  }

  // Data Info Modal - NEW FEATURE
  showDataInfo(cardElement) {
    if (!this.currentUser || this.currentUser.role !== 'superadmin') {
      return;
    }

    const dataSource = cardElement.dataset.source;
    const dataFormula = cardElement.dataset.formula;
    
    // Get data details
    let sourceData = [];
    let lastUpdated = 'N/A';
    let recordCount = 0;

    switch(dataSource) {
      case 'production_plans':
        sourceData = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        recordCount = sourceData.length;
        lastUpdated = sourceData.length > 0 ? new Date(Math.max(...sourceData.map(p => new Date(p.createdDate)))).toLocaleString() : 'N/A';
        break;
      case 'equipment':
        sourceData = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        recordCount = sourceData.length;
        lastUpdated = 'Static data';
        break;
      case 'materials':
        sourceData = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        recordCount = sourceData.length;
        lastUpdated = sourceData.length > 0 ? new Date(Math.max(...sourceData.map(m => new Date(m.lastUpdated)))).toLocaleString() : 'N/A';
        break;
    }

    // Update modal content
    document.getElementById('data-info-title').textContent = `Data Source: ${cardElement.querySelector('h3').textContent.replace(' ℹ️', '')}`;
    document.getElementById('data-source-text').textContent = `localStorage.${dataSource}`;
    document.getElementById('data-formula-text').textContent = dataFormula;
    document.getElementById('data-updated-text').textContent = lastUpdated;
    document.getElementById('data-count-text').textContent = `${recordCount} records`;

    this.showModal('data-info-modal');
  }

  // Calendar Methods - ENHANCED AND FIXED
  loadCalendar() {
    try {
      const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
      const calendarData = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
      
      // Update month label - FIXED BUG
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const monthLabel = document.getElementById('calendar-month-label');
      if (monthLabel) {
        monthLabel.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
      }

      const calendarContainer = document.getElementById('equipment-calendar');
      if (!calendarContainer) return;

      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      
      // Set grid template columns dynamically
      calendarContainer.style.gridTemplateColumns = `150px repeat(${daysInMonth}, 1fr)`;
      
      // Clear existing content
      calendarContainer.innerHTML = '';

      // Add equipment header
      const equipmentHeaderDiv = document.createElement('div');
      equipmentHeaderDiv.className = 'calendar-equipment-header';
      equipmentHeaderDiv.textContent = 'Equipment';
      calendarContainer.appendChild(equipmentHeaderDiv);

      // Add day headers
      for (let day = 1; day <= daysInMonth; day++) {
        const dayHeaderDiv = document.createElement('div');
        dayHeaderDiv.className = 'calendar-header';
        dayHeaderDiv.textContent = day.toString();
        calendarContainer.appendChild(dayHeaderDiv);
      }

      // Add equipment rows
      equipment.forEach(eq => {
        // Equipment name cell with double-click edit for super admin
        const equipmentNameDiv = document.createElement('div');
        equipmentNameDiv.className = 'calendar-equipment-header';
        equipmentNameDiv.textContent = eq.name;
        
        // Add double-click editing for super admin
        if (this.currentUser && this.currentUser.role === 'superadmin') {
          equipmentNameDiv.style.cursor = 'pointer';
          equipmentNameDiv.addEventListener('dblclick', () => this.editEquipmentName(eq.id));
        }
        
        calendarContainer.appendChild(equipmentNameDiv);

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
          const cellKey = `${eq.id}-${this.currentYear}-${this.currentMonth}-${day}`;
          const cellData = calendarData.find(c => c.key === cellKey);
          
          const cellDiv = document.createElement('div');
          cellDiv.className = 'calendar-cell';
          cellDiv.dataset.equipmentId = eq.id;
          cellDiv.dataset.day = day;
          
          if (cellData) {
            cellDiv.classList.add(cellData.type);
            
            if (cellData.batchInfo) {
              const batchInfoDiv = document.createElement('div');
              batchInfoDiv.className = 'batch-info';
              batchInfoDiv.textContent = cellData.batchInfo;
              cellDiv.appendChild(batchInfoDiv);
            }
            
            if (cellData.notes) {
              const notesDiv = document.createElement('div');
              notesDiv.className = 'batch-notes';
              notesDiv.textContent = cellData.notes;
              cellDiv.appendChild(notesDiv);
            }
          }

          // Add click handler for admin/superadmin
          if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superadmin')) {
            cellDiv.addEventListener('click', () => this.editCalendarCell(eq.id, day));
          }

          calendarContainer.appendChild(cellDiv);
        }
      });

    } catch (error) {
      console.error('Error loading calendar:', error);
      this.showToast('Error loading calendar', 'error');
    }
  }

  // FIXED: Calendar navigation bug
  changeMonth(direction) {
    this.currentMonth += direction;
    
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    // Reload calendar with new month/year
    if (this.currentView === 'calendar') {
      this.loadCalendar();
    }
  }

  // Equipment name editing for super admin - ENHANCED
  editEquipmentName(equipmentId) {
    if (!this.currentUser || this.currentUser.role !== 'superadmin') return;

    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const eq = equipment.find(e => e.id == equipmentId);
    if (!eq) return;

    const newName = prompt('Edit equipment name:', eq.name);
    if (newName && newName.trim() && newName.trim() !== eq.name) {
      eq.name = newName.trim();
      localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
      this.loadCalendar();
      this.renderEquipmentPanel();
      this.showToast('Equipment name updated', 'success');
    }
  }

  editCalendarCell(equipmentId, day) {
    if (!this.currentUser ||
