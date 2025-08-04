class PharmaPlanningApp {
  constructor() {
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.charts = {};
    this.initializeData();
    this.bindEvents();
    this.checkAuth();
  }

  // Default sample data
  initializeData() {
    if (!localStorage.getItem('pharma_users')) {
      const users = [
        {id:1,username:'superadmin',email:'super@pharma.com',role:'superadmin',password:'TempPass123!',mustChangePassword:true},
        {id:2,username:'admin1',email:'admin@pharma.com',role:'admin',password:'TempPass123!',mustChangePassword:true},
        {id:3,username:'user1',email:'user@pharma.com',role:'user',password:'TempPass123!',mustChangePassword:true}
      ];
      localStorage.setItem('pharma_users', JSON.stringify(users));
      localStorage.setItem('pharma_company', JSON.stringify({name:'PharmaCorp Manufacturing',logoUrl:''}));
      const materials=[{id:1,name:'Ingredient A',currentStock:500,minimumStock:100,unit:'kg'}];
      localStorage.setItem('pharma_materials',JSON.stringify(materials));
      const equipment=[{id:1,name:'Tablet Press',type:'Manufacturing',status:'Available',location:'Floor A'}];
      localStorage.setItem('pharma_equipment',JSON.stringify(equipment));
      const plans=[{id:1,drugName:'Aspirin',quantity:10000,month:'Aug',year:new Date().getFullYear(),status:'Planned'}];
      localStorage.setItem('pharma_production_plans',JSON.stringify(plans));
      localStorage.setItem('pharma_calendar',JSON.stringify([]));
    }
  }

  bindEvents() {
    document.addEventListener('DOMContentLoaded',()=>{
      // Login/Signup
      document.querySelectorAll('.tab-btn').forEach(btn=>btn.onclick=()=>this.switchTab(btn.dataset.tab));
      document.getElementById('login-form').onsubmit=e=>this.login(e);
      document.getElementById('signup-form').onsubmit=e=>this.signup(e);
      document.getElementById('logout-btn').onclick=()=>this.logout();
      // Dark mode
      document.getElementById('dark-toggle').onchange=e=>{
        document.body.classList.toggle('dark', e.target.checked);
      };
      // Nav
      document.querySelectorAll('.nav-btn').forEach(btn=>btn.onclick=()=>this.switchView(btn.dataset.view));
      // Dashboard info clicks
      document.querySelectorAll('.clickable-card').forEach(card=>card.onclick=()=>this.showDataInfo(card));
      // Company edit
      document.getElementById('company-name').onclick=()=>this.editCompanyName();
      document.getElementById('logo-placeholder').onclick=()=>document.getElementById('logo-upload').click();
      document.getElementById('logo-upload').onchange=e=>this.uploadLogo(e);
      // Add/edit actions...
      // Month nav
      document.getElementById('prev-month').onclick=()=>this.changeMonth(-1);
      document.getElementById('next-month').onclick=()=>this.changeMonth(1);
      // Add equipment
      document.getElementById('add-equipment-btn').onclick=()=>this.showModal('equipment-modal');
      // Form submissions
      document.getElementById('add-production-form').onsubmit=e=>this.addProduction(e);
      document.getElementById('add-material-form').onsubmit=e=>this.addMaterial(e);
      document.getElementById('equipment-form').onsubmit=e=>this.saveEquipment(e);
      document.getElementById('add-user-form').onsubmit=e=>this.addUser(e);
      document.getElementById('dashboard-settings-form').onsubmit=e=>this.saveDashboardSettings(e);
      // Modal closes
      document.querySelectorAll('.modal-close').forEach(b=>b.onclick=e=>this.hideModal(b.closest('.modal').id));
      document.querySelectorAll('.modal-overlay').forEach(o=>o.onclick=e=>this.hideModal(o.closest('.modal').id));
      // Calendar cell click
      document.getElementById('equipment-calendar').onclick=e=>{
        const cell=e.target.closest('.calendar-cell');
        if(cell) this.editCalendarCell(cell.dataset.equipmentId,cell.dataset.day);
      };
      document.getElementById('calendar-edit-form').onsubmit=e=>this.saveCalendar(e);
      document.getElementById('clear-schedule').onclick=()=>this.clearSchedule();
      // Initial load
      this.checkAuth();
    });
  }

  checkAuth() {
    const u=localStorage.getItem('pharma_current_user');
    if(u) this.currentUser=JSON.parse(u),this.showMain();
    else this.showLogin();
  }

  showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
  }

  showMain() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    this.updateUI();
    this.switchView(this.currentView);
  }

  switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    document.querySelectorAll('.auth-form').forEach(f=>f.classList.toggle('active',f.id===`${tab}-form`));
  }

  switchView(view) {
    this.currentView=view;
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`${view}-view`));
    if(view==='dashboard') this.loadDashboard();
    if(view==='production') this.loadProduction();
    if(view==='calendar') this.loadCalendar();
    if(view==='stock') this.loadStock();
    if(view==='reports') this.loadReports();
    if(view==='users') this.loadUsers();
  }

  login(e) {
    e.preventDefault();
    const u=document.getElementById('login-username').value,
          p=document.getElementById('login-password').value;
    const users=JSON.parse(localStorage.getItem('pharma_users')), user=users.find(x=>x.username===u&&x.password===p);
    if(user) {
      this.currentUser=user; localStorage.setItem('pharma_current_user',JSON.stringify(user));
      if(user.mustChangePassword)this.showModal('password-change-modal');
      else this.showMain();
    } else this.showToast('Invalid credentials','error');
  }

  signup(e) {
    e.preventDefault();
    const u=document.getElementById('signup-username').value,
          eaddr=document.getElementById('signup-email').value,
          p=document.getElementById('signup-password').value,
          r=document.getElementById('signup-role').value;
    let users=JSON.parse(localStorage.getItem('pharma_users'));
    if(users.find(x=>x.username===u)){this.showToast('Username taken','error');return;}
    const nu={id:Date.now(),username:u,email:eaddr,password:p,role:r,mustChangePassword:true};
    users.push(nu); localStorage.setItem('pharma_users',JSON.stringify(users));
    this.showToast('Account created!','success');this.switchTab('login');
  }

  handlePasswordChange(e) {
    e.preventDefault();
    const np=document.getElementById('new-password').value,
          cp=document.getElementById('confirm-password').value;
    if(np!==cp){this.showToast('Mismatch','error');return;}
    let users=JSON.parse(localStorage.getItem('pharma_users')),idx=users.findIndex(x=>x.id===this.currentUser.id);
    users[idx].password=np;users[idx].mustChangePassword=false;
    localStorage.setItem('pharma_users',JSON.stringify(users));
    this.currentUser=users[idx];localStorage.setItem('pharma_current_user',JSON.stringify(this.currentUser));
    this.hideModal('password-change-modal');this.showMain();
  }

  logout() {
    localStorage.removeItem('pharma_current_user');this.showLogin();
  }

  updateUI() {
    document.getElementById('user-welcome').textContent=`Welcome, ${this.currentUser.username}`;
    document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!['admin','superadmin'].includes(this.currentUser.role)));
    document.querySelectorAll('.superadmin-only').forEach(el=>el.style.display=this.currentUser.role==='superadmin'?'inline':'none');
    // Company
    const c=JSON.parse(localStorage.getItem('pharma_company'));
    document.getElementById('company-name').textContent=c.name;
  }

  // Data Info
  showDataInfo(card) {
    if(this.currentUser.role!=='superadmin')return;
    const src=card.dataset.source, formula=card.dataset.formula;
    let data=JSON.parse(localStorage.getItem(`pharma_${src}`)), count=data.length||0, updated='N/A';
    if(src==='production_plans') updated=data.length?new Date(Math.max(...data.map(x=>new Date(x.createdDate)))).toLocaleString():'N/A';
    else if(src==='materials') updated=data.length?new Date(Math.max(...data.map(x=>new Date(x.lastUpdated)))).toLocaleString():'N/A';
    document.getElementById('data-info-title').textContent=card.querySelector('h3').textContent.replace(' ℹ️','');
    document.getElementById('data-source-text').textContent=`localStorage.pharma_${src}`;
    document.getElementById('data-formula-text').textContent=formula;
    document.getElementById('data-updated-text').textContent=updated;
    document.getElementById('data-count-text').textContent=`${count} records`;
    this.showModal('data-info-modal');
  }

  // Dashboard
  loadDashboard() {
    // Trend
    const plans=JSON.parse(localStorage.getItem('pharma_production_plans'));
    const total=plans.reduce((s,p)=>s+p.quantity,0);
    document.getElementById('total-production').textContent=total.toLocaleString();
    this.renderChart('production-chart','bar',plans);
    this.renderChart('analytics-chart','line',plans);
    // Util
    const eq=JSON.parse(localStorage.getItem('pharma_equipment'));
    document.getElementById('available-equipment').textContent=eq.filter(x=>x.status==='Available').length;
    document.getElementById('busy-equipment').textContent=eq.filter(x=>x.status==='In Use').length;
    document.getElementById('maintenance-equipment').textContent=eq.filter(x=>x.status==='Maintenance').length;
    // Stock Alerts
    const mats=JSON.parse(localStorage.getItem('pharma_materials'));
    const lows=mats.filter(x=>x.currentStock<=x.minimumStock);
    const cont=document.getElementById('stock-alerts');cont.innerHTML='';
    if(!lows.length) cont.innerHTML='<p>No stock alerts</p>';
    else lows.forEach(m=>cont.innerHTML+=`<div>${m.name}: ${m.currentStock}${m.unit}</div>`);
  }

  renderChart(id,type,dataArr) {
    const ctx=document.getElementById(id).getContext('2d');
    const labels=[], data=[];
    const map={};
    dataArr.forEach(d=>{
      const key=type==='bar'?`${d.month} ${d.year}`:`${d.month} ${d.year}`;
      map[key]=(map[key]||0)+d.quantity;
    });
    Object.keys(map).forEach(k=>{labels.push(k);data.push(map[k]);});
    if(!labels.length){labels.push(`${new Date().toLocaleString('default',{month:'short'})} ${new Date().getFullYear()}`);data.push(0);}
    if(this.charts[id]) this.charts[id].destroy();
    this.charts[id]=new Chart(ctx,{type,data:{labels,datasets:[{label:'',data,backgroundColor:'rgba(33,128,141,0.6)',borderColor:'rgba(33,128,141,1)',fill:type==='line'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
  }

  // Production Plans
  loadProduction() {
    const plans=JSON.parse(localStorage.getItem('pharma_production_plans'));
    const cont=document.getElementById('production-plans-list');cont.innerHTML='';
    plans.forEach(p=>cont.innerHTML+=`<div class="production-plan-item"><b>${p.drugName}</b>: ${p.quantity} units (${p.month} ${p.year})</div>`);
  }
  addProduction(e) {
    e.preventDefault();
    const m=document.getElementById('add-month').value,
          y=document.getElementById('add-year').value,
          d=document.getElementById('add-drug-name').value,
          q=+document.getElementById('add-quantity').value;
    const arr=JSON.parse(localStorage.getItem('pharma_production_plans'));
    arr.push({id:Date.now(),drugName:d,quantity:q,month:m,year:y,status:'Planned',createdDate:new Date().toISOString()});
    localStorage.setItem('pharma_production_plans',JSON.stringify(arr));
    this.hideModal('add-production-modal');this.loadProduction();
  }

  // Calendar
  loadCalendar() {
    const eq=JSON.parse(localStorage.getItem('pharma_equipment')),
          cal=JSON.parse(localStorage.getItem('pharma_calendar'));
    const header=document.getElementById('calendar-month-label'),
          monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
    header.textContent=`${monthNames[this.currentMonth]} ${this.currentYear}`;
    const days=new Date(this.currentYear,this.currentMonth+1,0).getDate();
    const grid=document.getElementById('equipment-calendar');
    grid.innerHTML='';grid.style.gridTemplateColumns=`150px repeat(${days},1fr)`;
    // headings
    grid.innerHTML+='<div class="calendar-equipment-header">Equipment</div>';
    for(let d=1;d<=days;d++) grid.innerHTML+=`<div class="calendar-header">${d}</div>`;
    // rows
    eq.forEach(e=> {
      grid.innerHTML+=`<div class="calendar-equipment-header" ondblclick="pharmaApp.editEquipmentName(${e.id})">${e.name}</div>`;
      for(let d=1;d<=days;d++){
        const key=`${e.id}-${this.currentYear}-${this.currentMonth}-${d}`,
              rec=cal.find(x=>x.key===key)||{};
        const cls=rec.type||'', info=`${rec.batchInfo||''}`+(rec.notes?`<div class="batch-notes">${rec.notes}</div>`:'');
        grid.innerHTML+=`<div class="calendar-cell ${cls}" data-eid="${e.id}" data-day="${d}">${info}</div>`;
      }
    });
  }
  changeMonth(dir){
    this.currentMonth+=dir;
    if(this.currentMonth>11){this.currentMonth=0;this.currentYear++}
    if(this.currentMonth<0){this.currentMonth=11;this.currentYear--}
    if(this.currentView==='calendar')this.loadCalendar();
  }
  editCalendarCell(eid,day){ /* ... show edit modal ... */ }
  saveCalendar(e){e.preventDefault();/* ... */}

  // Stock
  loadStock() {
    const mats=JSON.parse(localStorage.getItem('pharma_materials')),cont=document.getElementById('materials-list');cont.innerHTML='';
    mats.forEach(m=>cont.innerHTML+=`<div class="material-item">${m.name}: ${m.currentStock}${m.unit}</div>`);
  }
  addMaterial(e){e.preventDefault();const n=document.getElementById('material-name').value;const cs=+document.getElementById('material-stock').value;const ms=+document.getElementById('material-min-stock').value;const u=document.getElementById('material-unit').value;const arr=JSON.parse(localStorage.getItem('pharma_materials'));arr.push({id:Date.now(),name:n,currentStock:cs,minimumStock:ms,unit:u,lastUpdated:new Date().toISOString()});localStorage.setItem('pharma_materials',JSON.stringify(arr));this.hideModal('add-material-modal');this.loadStock();}

  // Reports
  loadReports(){
    const plans=JSON.parse(localStorage.getItem('pharma_production_plans')).length;
    const eq=JSON.parse(localStorage.getItem('pharma_equipment')).length;
    const mats=JSON.parse(localStorage.getItem('pharma_materials')).filter(x=>x.currentStock<=x.minimumStock).length;
    const cont=document.getElementById('reports-list');
    cont.innerHTML=`<div class="card"><div>Total Plans: ${plans}</div><div>Equipment: ${eq}</div><div>Low Stock: ${mats}</div></div>`;
  }

  // Users
  loadUsers(){
    const users=JSON.parse(localStorage.getItem('pharma_users')),cont=document.getElementById('users-list');
    cont.innerHTML='';users.forEach(u=>cont.innerHTML+=`<div class="user-item"><b>${u.username}</b> (${u.role})</div>`);
  }
  addUser(e){e.preventDefault();const u=document.getElementById('user-username').value;const em=document.getElementById('user-email').value;const pw=document.getElementById('user-password').value;const r=document.getElementById('user-role').value;const arr=JSON.parse(localStorage.getItem('pharma_users'));arr.push({id:Date.now(),username:u,email:em,password:pw,role:r,mustChangePassword:true});localStorage.setItem('pharma_users',JSON.stringify(arr));this.hideModal('add-user-modal');this.loadUsers();}

  // Company editing
  editCompanyName(){
    document.getElementById('company-name').classList.add('hidden');
    document.getElementById('company-name-input').classList.remove('hidden');
    document.getElementById('company-name-input').value=document.getElementById('company-name').textContent;
  }
  uploadLogo(e){
    const f=e.target.files[0],r=new FileReader();
    r.onload=()=>{const url=r.result;const c=JSON.parse(localStorage.getItem('pharma_company'));c.logoUrl=url;localStorage.setItem('pharma_company',JSON.stringify(c));this.updateUI();}
    r.readAsDataURL(f);
  }

  // Dashboard settings
  saveDashboardSettings(e){e.preventDefault();/* ... */}

  // Equipment management
  saveEquipment(e){e.preventDefault();/* ... */}

  showModal(id){document.getElementById(id).classList.remove('hidden')}
  hideModal(id){document.getElementById(id).classList.add('hidden')}

  showToast(msg,type='info'){const t=document.createElement('div');t.className=`toast toast--${type}`;t.textContent=msg;document.getElementById('toast-container').append(t);setTimeout(()=>t.remove(),3000);}
}

// Initialize
window.pharmaApp=new PharmaPlanningApp();
