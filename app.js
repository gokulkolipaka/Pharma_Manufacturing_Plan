// Pharma Planning App - FIXED VERSION
console.log('🚀 Initializing Pharma Planning App...');

class PharmaApp {
    constructor() {
        this.currentUser = null;
        this.charts = {};
        
        // Initialize immediately
        this.initializeData();
        this.init();
    }

    init() {
        // Wait for DOM to be completely ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('✅ DOM loaded, attaching events...');
                this.attachEvents();
                this.checkAuth();
            });
        } else {
            console.log('✅ DOM ready, attaching events...');
            this.attachEvents();
            this.checkAuth();
        }
    }

    initializeData() {
        // FIXED: Always ensure fresh sample data
        const users = [
            {
                id: 1,
                username: 'superadmin',
                email: 'super@pharma.com',
                password: 'TempPass123!',
                role: 'superadmin',
                mustChangePassword: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'admin1',
                email: 'admin@pharma.com',
                password: 'TempPass123!',
                role: 'admin',
                mustChangePassword: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'user1',
                email: 'user@pharma.com',
                password: 'TempPass123!',
                role: 'user',
                mustChangePassword: true,
                createdAt: new Date().toISOString()
            }
        ];

        // Only initialize if not exists
        if (!localStorage.getItem('pharma_users')) {
            localStorage.setItem('pharma_users', JSON.stringify(users));
            localStorage.setItem('pharma_company', JSON.stringify({
                name: 'PharmaCorp Manufacturing',
                logoUrl: ''
            }));
            console.log('✅ Sample data initialized');
        }
    }

    attachEvents() {
        console.log('🔗 Attaching event listeners...');

        // FIXED: Login form event
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                console.log('📝 Login form submitted');
                this.handleLogin(e);
            });
            console.log('✅ Login form listener attached');
        } else {
            console.error('❌ Login form not found');
        }

        // FIXED: Signup form event
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                console.log('📝 Signup form submitted');
                this.handleSignup(e);
            });
            console.log('✅ Signup form listener attached');
        }

        // FIXED: Password change form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                console.log('📝 Password form submitted');
                this.handlePasswordChange(e);
            });
            console.log('✅ Password form listener attached');
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Dark mode toggle
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('dark-mode', e.target.checked);
                localStorage.setItem('darkMode', e.target.checked);
            });
            
            // Load saved preference
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            darkToggle.checked = savedDarkMode;
            document.body.classList.toggle('dark-mode', savedDarkMode);
        }

        // Company name editing
        const companyName = document.getElementById('companyName');
        if (companyName) {
            companyName.addEventListener('click', () => this.editCompanyName());
        }

        const companyNameInput = document.getElementById('companyNameInput');
        if (companyNameInput) {
            companyNameInput.addEventListener('blur', () => this.saveCompanyName());
            companyNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveCompanyName();
            });
        }

        // Logo upload
        const logoContainer = document.getElementById('logoContainer');
        if (logoContainer) {
            logoContainer.addEventListener('click', () => {
                document.getElementById('logoUpload')?.click();
            });
        }

        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        console.log('✅ All event listeners attached successfully');
    }

    // FIXED: Login handler with detailed logging
    handleLogin(e) {
        e.preventDefault(); // CRITICAL: Prevent form submission
        console.log('🔐 Processing login...');

        const usernameEl = document.getElementById('loginUsername');
        const passwordEl = document.getElementById('loginPassword');

        if (!usernameEl || !passwordEl) {
            console.error('❌ Login form elements not found');
            this.showToast('Login form error. Please refresh the page.', 'error');
            return;
        }

        const username = usernameEl.value.trim();
        const password = passwordEl.value;

        console.log(`👤 Login attempt: ${username}`);

        if (!username || !password) {
            this.showToast('Please enter both username and password', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
            console.log(`👥 Found ${users.length} users in storage`);
            
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                console.log(`✅ Login successful for: ${user.username} (${user.role})`);
                this.currentUser = user;
                localStorage.setItem('pharma_current_user', JSON.stringify(user));
                
                this.showToast('Login successful!', 'success');
                
                if (user.mustChangePassword) {
                    setTimeout(() => {
                        this.showModal('passwordModal');
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.showMainApp();
                    }, 1000);
                }
            } else {
                console.log('❌ Invalid credentials');
                this.showToast('Invalid username or password', 'error');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
        }
    }

    // FIXED: Signup handler
    handleSignup(e) {
        e.preventDefault();
        console.log('📝 Processing signup...');
        
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;

        if (!username || !email || !password) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

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
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('pharma_users', JSON.stringify(users));
            
            this.showToast('Account created successfully! Please login.', 'success');
            this.switchTab('login');
            document.getElementById('signupForm').reset();
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('Signup failed. Please try again.', 'error');
        }
    }

    // FIXED: Password change handler
    handlePasswordChange(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

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
                
                this.hideModal('passwordModal');
                this.showToast('Password changed successfully!', 'success');
                setTimeout(() => {
                    this.showMainApp();
                }, 1000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            this.showToast('Password change failed. Please try again.', 'error');
        }
    }

    checkAuth() {
        const savedUser = localStorage.getItem('pharma_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log(`👤 Existing user found: ${this.currentUser.username}`);
                this.showMainApp();
            } catch (error) {
                console.error('Auth error:', error);
                this.showLogin();
            }
        } else {
            console.log('👤 No saved user, showing login');
            this.showLogin();
        }
    }

    showLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
        
        console.log('🔐 Login screen displayed');
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        this.updateUserInterface();
        console.log('🏠 Main app displayed');
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome, ${this.currentUser.username}`;
        }

        // Show/hide admin elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (['admin', 'superadmin'].includes(this.currentUser.role)) {
                el.classList.add('show');
                el.style.display = '';
            } else {
                el.classList.remove('show');
                el.style.display = 'none';
            }
        });

        // Load company info
        const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
        const companyNameEl = document.getElementById('companyName');
        if (companyNameEl) {
            companyNameEl.textContent = company.name || 'PharmaCorp Manufacturing';
        }
    }

    logout() {
        localStorage.removeItem('pharma_current_user');
        this.currentUser = null;
        this.showLogin();
        this.showToast('Logged out successfully', 'info');
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        const tabForm = document.getElementById(`${tab}Form`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabForm) tabForm.classList.add('active');
    }

    switchView(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        const navBtn = document.querySelector(`[data-view="${view}"]`);
        const viewEl = document.getElementById(`${view}View`);
        
        if (navBtn) navBtn.classList.add('active');
        if (viewEl) viewEl.classList.add('active');
    }

    editCompanyName() {
        const nameEl = document.getElementById('companyName');
        const inputEl = document.getElementById('companyNameInput');
        
        if (nameEl && inputEl) {
            inputEl.value = nameEl.textContent;
            nameEl.classList.add('hidden');
            inputEl.classList.remove('hidden');
            inputEl.focus();
        }
    }

    saveCompanyName() {
        const nameEl = document.getElementById('companyName');
        const inputEl = document.getElementById('companyNameInput');
        
        if (nameEl && inputEl) {
            const newName = inputEl.value.trim();
            if (newName) {
                nameEl.textContent = newName;
                
                const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                company.name = newName;
                localStorage.setItem('pharma_company', JSON.stringify(company));
                
                this.showToast('Company name updated!', 'success');
            }
            
            nameEl.classList.remove('hidden');
            inputEl.classList.add('hidden');
        }
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoUrl = event.target.result;
                const logoEl = document.getElementById('companyLogo');
                const placeholderEl = document.getElementById('logoPlaceholder');
                
                if (logoEl && placeholderEl) {
                    logoEl.src = logoUrl;
                    logoEl.classList.remove('hidden');
                    placeholderEl.style.display = 'none';
                    
                    const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                    company.logoUrl = logoUrl;
                    localStorage.setItem('pharma_company', JSON.stringify(company));
                    
                    this.showToast('Logo updated!', 'success');
                }
            };
            reader.readAsDataURL(file);
        }
    }

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

    showToast(message, type = 'info') {
        console.log(`📢 Toast: ${message} (${type})`);
        
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the app
console.log('🎯 Starting Pharma Planning App...');
window.pharmaApp = new PharmaApp();
