class PharmaPlanningApp {
  constructor() {
    this.currentUser = null;
    this.currentView = "dashboard";
    const d = new Date();
    this.currentMonth = d.getMonth(); // 0-based
    this.currentYear = d.getFullYear();

    this.charts = {};
    this.initialize();
  }

  initialize() {
    this.initData();
    this.bindEvents();
    this.checkAuth();
  }

  // Initialize localStorage sample data if none exists
  initData() {
    if (!localStorage.getItem("pharma_users")) {
      const users = [
        { id: 1, username: "superadmin", email: "super@pharma.com", role: "superadmin", password: "TempPass123!", mustChangePassword: true, createdDate: new Date().toISOString() },
        { id: 2, username: "admin1", email: "admin@pharma.com", role: "admin", password: "TempPass123!", mustChangePassword: true, createdDate: new Date().toISOString() },
        { id: 3, username: "user1", email: "user@pharma.com", role: "user", password: "TempPass123!", mustChangePassword: true, createdDate: new Date().toISOString() }
      ];

      const company = {
        name: "PharmaCorp Manufacturing",
        logoUrl: ""
      };

      const materials = [
        { id: 1, name: "Active Ingredient A", currentStock: 500, minimumStock: 100, unit: "kg", lastUpdated: new Date().toISOString() },
        { id: 2, name: "Excipient B", currentStock: 50, minimumStock: 150, unit: "kg", lastUpdated: new Date().toISOString() },
        { id: 3, name: "Coating Material", currentStock: 200, minimumStock: 80, unit: "kg", lastUpdated: new Date().toISOString() }
      ];

      const equipment = [
        { id: 1, name: "Tablet Press 1", type: "Manufacturing", status: "Available", location: "Production Floor A" },
        { id: 2, name: "Coating Machine", type: "Manufacturing", status: "Available", location: "Production Floor B" },
        { id: 3, name: "Blender Unit 1", type: "Mixing", status: "Maintenance", location: "Production Floor A" },
        { id: 4, name: "Granulator", type: "Processing", status: "Available", location: "Production Floor A" },
        { id: 5, name: "Capsule Filler", type: "Manufacturing", status: "In Use", location: "Production Floor C" }
      ];

      const productionPlans = [
        { id: 1, drugName: "Aspirin 100mg", quantity: 10000, month: "March", year: 2025, status: "Planned", requestedBy: "BD Team", createdDate: new Date().toISOString() },
        { id: 2, drugName: "Vitamin C 500mg", quantity: 5000, month: "March", year: 2025, status: "In Progress", requestedBy: "BD Team", createdDate: new Date().toISOString() }
      ];

      localStorage.setItem("pharma_users", JSON.stringify(users));
      localStorage.setItem("pharma_company", JSON.stringify(company));
      localStorage.setItem("pharma_materials", JSON.stringify(materials));
      localStorage.setItem("pharma_equipment", JSON.stringify(equipment));
      localStorage.setItem("pharma_production_plans", JSON.stringify(productionPlans));
      localStorage.setItem("pharma_calendar", JSON.stringify([]));
    }
  }

  bindEvents() {
    document.addEventListener("DOMContentLoaded", () => {
      // Login/Signup Form Events
      const loginForm = document.getElementById("login-form");
      loginForm?.addEventListener("submit", (e) => this.login(e));

      const signupForm = document.getElementById("signup-form");
      signupForm?.addEventListener("submit", (e) => this.signup(e));

      const passwordChangeForm = document.getElementById("password-change-form");
      passwordChangeForm?.addEventListener("submit", (e) => this.changePassword(e));

      const logoutBtn = document.getElementById("logout-btn");
      logoutBtn?.addEventListener("click", () => this.logout());

      // Tab switching - login/signup
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
      });

      // Navigation buttons
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.navigate(btn.dataset.view));
      });

      // Logo upload and company name editing
      document.getElementById("logo-placeholder")?.addEventListener("click", () => {
        document.getElementById("logo-upload")?.click();
      });
      document.getElementById("logo-upload")?.addEventListener("change", (e) => this.handleLogoUpload(e));
      document.getElementById("company-name")?.addEventListener("click", () => this.startEditCompanyName());
      const companyInput = document.getElementById("company-name-input");
      companyInput?.addEventListener("blur", () => this.saveCompanyName());
      companyInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.saveCompanyName();
      });

      // Production plan controls
      document.getElementById("add-production-btn")?.addEventListener("click", () => this.showModal("add-production-modal"));
      document.getElementById("add-production-form")?.addEventListener("submit", (e) => this.addProductionPlan(e));

      // Calendar navigation + add equipment button
      document.getElementById("prev-month")?.addEventListener("click", () => this.changeMonth(-1));
      document.getElementById("next-month")?.addEventListener("click", () => this.changeMonth(1));
      document.getElementById("add-equipment-calendar")?.addEventListener("click", () => this.showModal("equipment-modal"));

      // Calendar editing modal
      document.getElementById("calendar-edit-form")?.addEventListener("submit", (e) => this.saveCalendarEdit(e));
      document.getElementById("clear-schedule")?.addEventListener("click", () => this.clearCalendarEntry());

      // Stock management
      document.getElementById("add-material-btn")?.addEventListener("click", () => this.showModal("add-material-modal"));
      document.getElementById("upload-stock-btn")?.addEventListener("click", () => document.getElementById("excel-upload")?.click());
      document.getElementById("excel-upload")?.addEventListener("change", (e) => this.handleExcelUpload(e));
      document.getElementById("add-material-form")?.addEventListener("submit", (e) => this.addMaterial(e));

      // Reports
      document.getElementById("export-csv-btn")?.addEventListener("click", () => this.exportCSV());
      document.getElementById("export-pdf-btn")?.addEventListener("click", () => this.exportPDF());
      document.getElementById("print-report-btn")?.addEventListener("click", () => window.print());

      // User management
      document.getElementById("add-user-btn")?.addEventListener("click", () => this.showModal("add-user-modal"));
      document.getElementById("add-user-form")?.addEventListener("submit", (e) => this.addUser(e));

      // Modal closing (buttons and overlays)
      document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", (e) => this.hideModal(e.target.closest(".modal").id));
      });
      document.querySelectorAll(".modal-overlay").forEach(over => {
        over.addEventListener("click", (e) => this.hideModal(e.target.closest(".modal").id));
      });

      // Equipment modal submit
      document.getElementById("equipment-form")?.addEventListener("submit", (e) => this.saveEquipment(e));

      // Dashboard customization form
      document.getElementById("dashboard-settings-form")?.addEventListener("submit", (e) => this.saveDashboardSettings(e));
    });
  }

  // Authentication and session

  checkAuth() {
    const userStr = localStorage.getItem("pharma_current_user");
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.showMainApp();
      } catch {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  login(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
      this.showToast("Please enter both username and password", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("pharma_users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      this.showToast("Invalid username or password", "error");
      return;
    }

    this.currentUser = user;
    localStorage.setItem("pharma_current_user", JSON.stringify(user));
    if (user.mustChangePassword) {
      this.showToast("Please change your password", "info");
      this.showModal("password-change-modal");
    } else {
      this.showToast("Login successful", "success");
      this.showMainApp();
    }
  }

  signup(e) {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const role = document.getElementById("signup-role").value || "user";

    if (!username || !email || !password) {
      this.showToast("Please fill all fields", "error");
      return;
    }

    let users = JSON.parse(localStorage.getItem("pharma_users") || "[]");
    if (users.find(u => u.username === username)) {
      this.showToast("Username already exists", "error");
      return;
    }
    if (users.find(u => u.email === email)) {
      this.showToast("Email already exists", "error");
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
    localStorage.setItem("pharma_users", JSON.stringify(users));
    this.showToast("Account created! Please login.", "success");
    this.switchTab("login");
    document.getElementById("signup-form")?.reset();
  }

  changePassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      this.showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      this.showToast("Password must be at least 8 characters", "error");
      return;
    }

    let users = JSON.parse(localStorage.getItem("pharma_users") || "[]");
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);

    if (userIndex === -1) {
      this.showToast("User not found", "error");
      return;
    }

    users[userIndex].password = newPassword;
    users[userIndex].mustChangePassword = false;
    localStorage.setItem("pharma_users", JSON.stringify(users));
    this.currentUser = users[userIndex];
    localStorage.setItem("pharma_current_user", JSON.stringify(this.currentUser));
    this.hideModal("password-change-modal");
    this.showToast("Password changed successfully", "success");
    this.showMainApp();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("pharma_current_user");
    this.showToast("Logged out", "info");
    this.showLogin();
  }

  showLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("main-app").classList.add("hidden");
    this.switchTab("login");
  }

  showMainApp() {
    document.getElementById("main-app").classList.remove("hidden");
    document.getElementById("login-screen").classList.add("hidden");
    this.updateUI();
    this.navigate(this.currentView);
  }

  switchTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach(form => form.classList.remove("active"));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.classList.add("active");
    document.getElementById(`${tab}-form`)?.classList.add("active");
  }

  navigate(view) {
    this.currentView = view;
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

    document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add("active");
    document.getElementById(`${view}-view`)?.classList.add("active");
    this.loadViewData(view);
  }

  updateUI() {
    if (!this.currentUser) return;

    document.getElementById("user-welcome").textContent = `Welcome, ${this.currentUser.username}`;

    // Show/hide admin elements
    document.querySelectorAll(".admin-only").forEach(el => {
      if (this.currentUser.role === "admin" || this.currentUser.role === "superadmin") el.classList.remove("hidden");
      else el.classList.add("hidden");
    });

    // Load company info
    const company = JSON.parse(localStorage.getItem("pharma_company") || "{}");
    const cname = document.getElementById("company-name");
    const cnameInput = document.getElementById("company-name-input");
    const logo = document.getElementById("company-logo");
    const logoPlaceholder = document.querySelector(".logo-placeholder");

    if (company.name) cname.textContent = company.name;
    else cname.textContent = "PharmaCorp Manufacturing";

    if (company.logoUrl) {
      logo.src = company.logoUrl;
      logo.style.display = "block";
      if (logoPlaceholder) logoPlaceholder.style.display = "none";
    } else {
      logo.style.display = "none";
      if (logoPlaceholder) logoPlaceholder.style.display = "block";
    }
    cname.style.display = "block";
    cnameInput.style.display = "none";
  }

  // Company logo upload
  handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const logoUrl = e.target.result;
      localStorage.setItem("pharma_company", JSON.stringify({
        ...(JSON.parse(localStorage.getItem("pharma_company") || "{}")),
        logoUrl
      }));
      this.updateUI();
    };
    reader.readAsDataURL(file);
  }
  startEditCompanyName() {
    const cname = document.getElementById("company-name");
    const cnameInput = document.getElementById("company-name-input");
    cnameInput.value = cname.textContent;
    cname.style.display = "none";
    cnameInput.style.display = "block";
    cnameInput.focus();
  }
  saveCompanyName() {
    const cname = document.getElementById("company-name");
    const cnameInput = document.getElementById("company-name-input");
    let newName = cnameInput.value.trim();

    if (!newName) {
      this.showToast("Company name cannot be empty", "error");
      return;
    }

    cname.textContent = newName;
    cname.style.display = "block";
    cnameInput.style.display = "none";

    localStorage.setItem("pharma_company", JSON.stringify({
      ...(JSON.parse(localStorage.getItem("pharma_company") || "{}")),
      name: newName
    }));
  }

  // Production Plans
  loadViewData(view) {
    switch (view) {
      case "dashboard": this.loadDashboard(); break;
      case "production": this.loadProductionPlans(); break;
      case "calendar": this.loadCalendar(); break;
      case "stock": this.loadStockManagement(); break;
      case "reports": this.loadReports(); break;
      case "users": this.loadUserManagement(); break;
    }
  }

  loadDashboard() {
    this.renderDashboardCustomizeBtn();

    let settings = JSON.parse(localStorage.getItem("dashboard_settings") || '{"showProductionTrend":true,"showUtilization":true,"showStockAlerts":true}');
    document.getElementById("production-trend-card").style.display = settings.showProductionTrend ? "" : "none";
    document.getElementById("utilization-card").style.display = settings.showUtilization ? "" : "none";
    document.getElementById("stock-alerts-card").style.display = settings.showStockAlerts ? "" : "none";

    const plans = JSON.parse(localStorage.getItem("pharma_production_plans") || "[]");
    const total = plans.reduce((sum, p) => sum + p.quantity, 0);
    document.getElementById("total-production").textContent = total.toLocaleString();

    const equipment = JSON.parse(localStorage.getItem("pharma_equipment") || "[]");
    document.getElementById("available-equipment").textContent = equipment.filter(e => e.status === "Available").length;
    document.getElementById("busy-equipment").textContent = equipment.filter(e => e.status === "In Use").length;
    document.getElementById("maintenance-equipment").textContent = equipment.filter(e => e.status === "Maintenance").length;

    const materials = JSON.parse(localStorage.getItem("pharma_materials") || "[]");
    const lowStock = materials.filter(m => m.currentStock <= m.minimumStock);
    const container = document.getElementById("stock-alerts");
    container.innerHTML = "";

    if (lowStock.length === 0) {
      container.innerHTML = "<p>No stock alerts</p>";
    } else {
      lowStock.forEach(m => {
        const div = document.createElement("div");
        div.className = "alert-item";
        div.textContent = `Low stock: ${m.name} (${m.currentStock} ${m.unit} remaining)`;
        container.appendChild(div);
      });
    }

    this.renderProductionChart(plans);
  }

  renderProductionChart(plans) {
    const ctx = document.getElementById("production-chart");
    if (!ctx) return;
    const chartCtx = ctx.getContext("2d");

    const monthlyQuantities = {};
    plans.forEach(p => {
      const label = `${p.month} ${p.year}`;
      monthlyQuantities[label] = (monthlyQuantities[label] || 0) + p.quantity;
    });

    const labels = Object.keys(monthlyQuantities).length > 0 ? Object.keys(monthlyQuantities) : ["March 2025"];
    const data = Object.values(monthlyQuantities).length > 0 ? Object.values(monthlyQuantities) : [15000];

    if (this.charts.production) {
      this.charts.production.destroy();
    }
    this.charts.production = new Chart(chartCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Production Quantity",
          data,
          backgroundColor: "#1FB8CD",
          borderColor: "#1FB8CD",
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        }
      }
    });
  }

  // Production Plans
  loadProductionPlans() {
    const container = document.getElementById("production-plans-list");
    const plans = JSON.parse(localStorage.getItem("pharma_production_plans") || "[]");
    container.innerHTML = "";

    if (plans.length === 0) {
      container.innerHTML = "<p>No production plans yet.</p>";
      return;
    }

    plans.forEach(plan => {
      const div = document.createElement("div");
      div.className = "production-plan-item";
      div.innerHTML = `
        <div class="production-plan-info">
          <h4>${this.escapeHtml(plan.drugName)}</h4>
          <p>Quantity: ${plan.quantity.toLocaleString()} units | Target: ${this.escapeHtml(plan.month)} ${plan.year} | Status: ${this.escapeHtml(plan.status)}</p>
        </div>
        <div class="production-plan-actions">
          <button class="btn btn--outline btn--sm" data-id="${plan.id}" onclick="window.pharmaApp.editProductionPlan(${plan.id})">Edit</button>
          <button class="btn btn--outline btn--sm" data-id="${plan.id}" onclick="window.pharmaApp.deleteProductionPlan(${plan.id})">Delete</button>
        </div>
      `;
      container.appendChild(div);
    });
  }

  addProductionPlan(e) {
    e.preventDefault();
    const drugName = document.getElementById("add-drug-name").value.trim();
    const quantity =
