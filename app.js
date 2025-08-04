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
        {"id": 2, "drugName": "Vitamin C 500mg", "quantity": 5000, "month": "March", "year": 2025, "status": "In Progress", "requestedBy": "BD Team", "createdDate": new Date().toISOString()}
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

  // UI Management
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

  // Dashboard Methods
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

      // Load production chart
      setTimeout(() => {
        this.loadProductionChart();
      }, 200);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showToast('Error loading dashboard data', 'error');
    }
  }

  loadProductionChart() {
    try {
      const ctx = document.getElementById('production-chart');
      if (!ctx) return;

      const chartCtx = ctx.getContext('2d');
      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');

      const monthlyData = {};
      productionPlans.forEach(plan => {
        const key = `${plan.month} ${plan.year}`;
        monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
      });

      const labels = Object.keys(monthlyData);
      const data = Object.values(monthlyData);

      if (this.charts.production) {
        this.charts.production.destroy();
      }

      this.charts.production = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['March 2025'],
          datasets: [{
            label: 'Production Quantity',
            data: data.length > 0 ? data : [15000],
            backgroundColor: '#1FB8CD',
            borderColor: '#1FB8CD',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading production chart:', error);
    }
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
    if (!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.role !== 'superadmin')) {
      return;
    }

    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const eq = equipment.find(e => e.id == equipmentId);
    if (!eq) return;

    const calendarData = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
    const cellKey = `${equipmentId}-${this.currentYear}-${this.currentMonth}-${day}`;
    const cellData = calendarData.find(c => c.key === cellKey);

    // Set modal title
    const modalTitle = document.getElementById('calendar-edit-title');
    if (modalTitle) {
      modalTitle.textContent = `Edit ${eq.name} - Day ${day}`;
    }

    // Fill form
    document.getElementById('edit-equipment-id').value = equipmentId;
    document.getElementById('edit-day').value = day;
    document.getElementById('edit-activity-type').value = cellData?.type || '';
    document.getElementById('edit-batch-info').value = cellData?.batchInfo || '';
    document.getElementById('edit-notes').value = cellData?.notes || '';

    this.showModal('calendar-edit-modal');
  }

  handleCalendarEdit(e) {
    e.preventDefault();
    
    const equipmentId = document.getElementById('edit-equipment-id').value;
    const day = document.getElementById('edit-day').value;
    const activityType = document.getElementById('edit-activity-type').value;
    const batchInfo = document.getElementById('edit-batch-info').value;
    const notes = document.getElementById('edit-notes').value;

    const cellKey = `${equipmentId}-${this.currentYear}-${this.currentMonth}-${day}`;
    let calendarData = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');

    // Remove existing entry
    calendarData = calendarData.filter(c => c.key !== cellKey);

    // Add new entry if activity type is selected
    if (activityType) {
      calendarData.push({
        key: cellKey,
        equipmentId: parseInt(equipmentId),
        year: this.currentYear,
        month: this.currentMonth,
        day: parseInt(day),
        type: activityType,
        batchInfo,
        notes,
        updatedBy: this.currentUser.username,
        updatedAt: new Date().toISOString()
      });
    }

    localStorage.setItem('pharma_calendar', JSON.stringify(calendarData));
    this.hideModal('calendar-edit-modal');
    this.loadCalendar();
    this.showToast('Schedule updated successfully', 'success');
  }

  clearSchedule() {
    const equipmentId = document.getElementById('edit-equipment-id').value;
    const day = document.getElementById('edit-day').value;
    const cellKey = `${equipmentId}-${this.currentYear}-${this.currentMonth}-${day}`;
    
    let calendarData = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
    calendarData = calendarData.filter(c => c.key !== cellKey);
    
    localStorage.setItem('pharma_calendar', JSON.stringify(calendarData));
    this.hideModal('calendar-edit-modal');
    this.loadCalendar();
    this.showToast('Schedule cleared', 'success');
  }

  // Production Methods
  loadProductionPlans() {
    try {
      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
      const container = document.getElementById('production-plans-list');
      if (!container) return;

      container.innerHTML = '';

      if (productionPlans.length === 0) {
        container.innerHTML = '<p>No production plans yet. Click "Add Production Plan" to get started.</p>';
        return;
      }

      productionPlans.forEach(plan => {
        const planDiv = document.createElement('div');
        planDiv.className = 'production-plan-item';
        planDiv.innerHTML = `
          <div class="production-plan-info">
            <h4>${plan.drugName}</h4>
            <p>Quantity: ${plan.quantity.toLocaleString()} units | Target: ${plan.month} ${plan.year} | Status: ${plan.status}</p>
          </div>
          <div class="production-plan-actions">
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.editProductionPlan(${plan.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.deleteProductionPlan(${plan.id})">Delete</button>
          </div>
        `;
        container.appendChild(planDiv);
      });
    } catch (error) {
      console.error('Error loading production plans:', error);
      this.showToast('Error loading production plans', 'error');
    }
  }

  handleAddProduction(e) {
    e.preventDefault();
    
    const drugName = document.getElementById('add-drug-name').value;
    const quantity = parseInt(document.getElementById('add-quantity').value);
    const month = document.getElementById('add-month').value;
    const year = parseInt(document.getElementById('add-year').value);

    try {
      const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
      const newPlan = {
        id: Date.now(),
        drugName,
        quantity,
        month,
        year,
        status: 'Planned',
        requestedBy: this.currentUser.username,
        createdDate: new Date().toISOString()
      };

      productionPlans.push(newPlan);
      localStorage.setItem('pharma_production_plans', JSON.stringify(productionPlans));

      this.hideModal('add-production-modal');
      document.getElementById('add-production-form').reset();
      this.loadProductionPlans();
      this.showToast('Production plan added successfully', 'success');
    } catch (error) {
      console.error('Error adding production plan:', error);
      this.showToast('Error adding production plan', 'error');
    }
  }

  editProductionPlan(id) {
    this.showToast('Edit functionality coming soon', 'info');
  }

  deleteProductionPlan(id) {
    if (confirm('Are you sure you want to delete this production plan?')) {
      try {
        let productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        productionPlans = productionPlans.filter(plan => plan.id !== id);
        localStorage.setItem('pharma_production_plans', JSON.stringify(productionPlans));
        this.loadProductionPlans();
        this.showToast('Production plan deleted', 'success');
      } catch (error) {
        console.error('Error deleting production plan:', error);
        this.showToast('Error deleting production plan', 'error');
      }
    }
  }

  // Stock Management Methods
  loadStockManagement() {
    try {
      const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
      const container = document.getElementById('materials-list');
      if (!container) return;

      container.innerHTML = '';

      if (materials.length === 0) {
        container.innerHTML = '<p>No materials in inventory. Click "Add Material" to get started.</p>';
        return;
      }

      materials.forEach(material => {
        const materialDiv = document.createElement('div');
        materialDiv.className = `material-item ${material.currentStock <= material.minimumStock ? 'low-stock' : ''}`;
        materialDiv.innerHTML = `
          <div class="material-info">
            <h4>${material.name}</h4>
            <div class="stock-levels">
              <span class="stock-current">Current: ${material.currentStock} ${material.unit}</span>
              <span class="stock-minimum">Minimum: ${material.minimumStock} ${material.unit}</span>
            </div>
          </div>
          <div class="stock-actions-item">
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.editMaterial(${material.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.deleteMaterial(${material.id})">Delete</button>
          </div>
        `;
        container.appendChild(materialDiv);
      });
    } catch (error) {
      console.error('Error loading materials:', error);
      this.showToast('Error loading materials', 'error');
    }
  }

  handleAddMaterial(e) {
    e.preventDefault();
    
    const name = document.getElementById('material-name').value;
    const currentStock = parseInt(document.getElementById('material-stock').value);
    const minimumStock = parseInt(document.getElementById('material-min-stock').value);
    const unit = document.getElementById('material-unit').value;

    try {
      const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
      const newMaterial = {
        id: Date.now(),
        name,
        currentStock,
        minimumStock,
        unit,
        lastUpdated: new Date().toISOString()
      };

      materials.push(newMaterial);
      localStorage.setItem('pharma_materials', JSON.stringify(materials));

      this.hideModal('add-material-modal');
      document.getElementById('add-material-form').reset();
      this.loadStockManagement();
      this.showToast('Material added successfully', 'success');
    } catch (error) {
      console.error('Error adding material:', error);
      this.showToast('Error adding material', 'error');
    }
  }

  editMaterial(id) {
    this.showToast('Edit functionality coming soon', 'info');
  }

  deleteMaterial(id) {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        let materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        materials = materials.filter(material => material.id !== id);
        localStorage.setItem('pharma_materials', JSON.stringify(materials));
        this.loadStockManagement();
        this.showToast('Material deleted', 'success');
      } catch (error) {
        console.error('Error deleting material:', error);
        this.showToast('Error deleting material', 'error');
      }
    }
  }

  handleExcelUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.showToast('Excel upload functionality will be implemented', 'info');
    }
  }

  // Reports Methods
  loadReports() {
    const container = document.getElementById('reports-list');
    if (!container) return;

    const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

    const totalUnits = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
    const activeEquipment = equipment.filter(eq => eq.status === 'Available').length;
    const lowStockItems = materials.filter(m => m.currentStock <= m.minimumStock).length;

    container.innerHTML = `
      <div class="card">
        <h3>Production Summary</h3>
        <div class="summary-item">
          <span class="summary-label">Total Units Planned:</span>
          <span class="summary-value">${totalUnits.toLocaleString()}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Active Equipment:</span>
          <span class="summary-value">${activeEquipment}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Low Stock Items:</span>
          <span class="summary-value">${lowStockItems}</span>
        </div>
      </div>
    `;
  }

  exportToCSV() {
    this.showToast('CSV export functionality will be implemented', 'info');
  }

  exportToPDF() {
    this.showToast('PDF export functionality will be implemented', 'info');
  }

  // User Management Methods
  loadUserManagement() {
    try {
      const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
      const container = document.getElementById('users-list');
      if (!container) return;

      container.innerHTML = '';

      users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
          <div class="user-info">
            <h4>${user.username}</h4>
            <div class="user-details">${user.email} | <span class="user-role ${user.role}">${user.role}</span></div>
          </div>
          <div class="user-actions">
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.editUser(${user.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.deleteUser(${user.id})">Delete</button>
          </div>
        `;
        container.appendChild(userDiv);
      });
    } catch (error) {
      console.error('Error loading users:', error);
      this.showToast('Error loading users', 'error');
    }
  }

  handleAddUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    try {
      const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
      
      if (users.find(u => u.username === username)) {
        this.showToast('Username already exists', 'error');
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

      this.hideModal('add-user-modal');
      document.getElementById('add-user-form').reset();
      this.loadUserManagement();
      this.showToast('User added successfully', 'success');
    } catch (error) {
      console.error('Error adding user:', error);
      this.showToast('Error adding user', 'error');
    }
  }

  editUser(id) {
    this.showToast('Edit functionality coming soon', 'info');
  }

  deleteUser(id) {
    if (id === this.currentUser.id) {
      this.showToast('Cannot delete your own account', 'error');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      try {
        let users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        users = users.filter(user => user.id !== id);
        localStorage.setItem('pharma_users', JSON.stringify(users));
        this.loadUserManagement();
        this.showToast('User deleted', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showToast('Error deleting user', 'error');
      }
    }
  }

  // Equipment Management Methods
  renderEquipmentPanel() {
    const user = this.currentUser;
    const panel = document.getElementById('equipment-panel');
    if (!panel) return;

    if (!(user && (user.role === 'admin' || user.role === 'superadmin'))) {
      panel.innerHTML = '';
      return;
    }

    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    let html = `
      <div class="card" style="margin-top:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Equipment Management</h3>
          <button class="btn btn--primary btn--sm" onclick="window.pharmaApp.openEquipmentModal()">Add Equipment</button>
        </div>
        <ul style="margin:0;padding-left:0;list-style:none;">
          ${equipment.map(eq =>
            `<li style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
               <div>
                 <b>${eq.name}</b> (${eq.type}, ${eq.location || "Unspecified"}) 
                 <span class="status status--${eq.status === 'Available' ? 'success' : eq.status === 'In Use' ? 'warning' : 'error'}" style="margin-left:8px;">${eq.status}</span>
               </div>
               <button class="btn btn--outline btn--sm" onclick="window.pharmaApp.editEquipment(${eq.id})">Edit</button>
             </li>`
          ).join('')}
        </ul>
      </div>
    `;
    panel.innerHTML = html;
  }

  openEquipmentModal() {
    this.editEquipment();
  }

  editEquipment(id) {
    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const eq = id ? equipment.find(e => e.id == id) : { name: '', type: '', location: '', status: 'Available', id: 0 };
    
    document.getElementById('equipment-modal-title').textContent = id ? 'Edit Equipment' : 'Add Equipment';
    document.getElementById('equipment-id').value = eq.id || '';
    document.getElementById('equipment-name').value = eq.name || '';
    document.getElementById('equipment-type').value = eq.type || '';
    document.getElementById('equipment-location').value = eq.location || '';
    document.getElementById('equipment-status').value = eq.status || 'Available';
    
    this.showModal('equipment-modal');
  }

  handleEquipmentSubmit(e) {
    e.preventDefault();
    
    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const id = document.getElementById('equipment-id').value;
    const name = document.getElementById('equipment-name').value;
    const type = document.getElementById('equipment-type').value;
    const location = document.getElementById('equipment-location').value;
    const status = document.getElementById('equipment-status').value;

    if (id) {
      // Edit
      const idx = equipment.findIndex(e => e.id == id);
      if (idx >= 0) equipment[idx] = { id: Number(id), name, type, location, status };
    } else {
      // Add
      const newId = equipment.length ? Math.max(...equipment.map(e => e.id)) + 1 : 1;
      equipment.push({ id: newId, name, type, location, status });
    }

    localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
    this.hideModal('equipment-modal');
    this.renderEquipmentPanel();
    if (this.currentView === 'calendar') {
      this.loadCalendar(); // Refresh calendar if on calendar view
    }
    this.showToast('Equipment saved successfully!', 'success');
  }

  // Dashboard Customization Methods
  renderDashboardCustomizeBtn() {
    const user = this.currentUser;
    const cont = document.getElementById('dashboard-customize-btn');
    if (!cont) return;

    if (user && user.role === 'superadmin') {
      cont.innerHTML = `<button class="btn btn--secondary btn--sm" onclick="window.pharmaApp.openDashboardCustomization()">Customize Dashboard</button>`;
    } else {
      cont.innerHTML = '';
    }
  }

  openDashboardCustomization() {
    const dft = { showProductionTrend: true, showUtilization: true, showStockAlerts: true };
    const settings = JSON.parse(localStorage.getItem('dashboard_settings') || JSON.stringify(dft));
    document.getElementById('dash-prod-trend').checked = !!settings.showProductionTrend;
    document.getElementById('dash-utilization').checked = !!settings.showUtilization;
    document.getElementById('dash-stock-alerts').checked = !!settings.showStockAlerts;
    this.showModal('dashboard-edit-modal');
  }

  handleDashboardSettings(e) {
    e.preventDefault();
    
    const settings = {
      showProductionTrend: document.getElementById('dash-prod-trend').checked,
      showUtilization: document.getElementById('dash-utilization').checked,
      showStockAlerts: document.getElementById('dash-stock-alerts').checked
    };

    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
    this.hideModal('dashboard-edit-modal');
    this.loadDashboard();
    this.showToast('Dashboard settings updated!', 'success');
  }

  // Company Management Methods
  enableCompanyNameEdit() {
    const nameEl = document.getElementById('company-name');
    const inputEl = document.getElementById('company-name-input');
    
    if (nameEl && inputEl) {
      inputEl.value = nameEl.textContent;
      nameEl.style.display = 'none';
      inputEl.style.display = 'block';
      inputEl.focus();
    }
  }

  saveCompanyName() {
    const nameEl = document.getElementById('company-name');
    const inputEl = document.getElementById('company-name-input');
    
    if (nameEl && inputEl) {
      const newName = inputEl.value.trim();
      if (newName) {
        nameEl.textContent = newName;
        
        const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
        company.name = newName;
        localStorage.setItem('pharma_company', JSON.stringify(company));
      }
      
      nameEl.style.display = 'block';
      inputEl.style.display = 'none';
    }
  }

  handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target.result;
        const logoEl = document.getElementById('company-logo');
        const placeholderEl = document.querySelector('.logo-placeholder');
        
        if (logoEl && placeholderEl) {
          logoEl.src = logoUrl;
          logoEl.style.display = 'block';
          placeholderEl.style.display = 'none';
          
          const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
          company.logoUrl = logoUrl;
          localStorage.setItem('pharma_company', JSON.stringify(company));
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Modal Management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Toast Notifications
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Global initialization
window.pharmaApp = new PharmaPlanningApp();
