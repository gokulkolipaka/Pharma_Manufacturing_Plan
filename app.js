class PharmaPlanningApp {
  constructor() {
    // (Initialization/data as in previous answers...)
    // The rest of your app logic is unchanged from prior responses,
    // except for the calendar rendering code, which is now below!
    // ... ALL OTHER CODE FROM PREVIOUS ANSWERS, UNCHANGED ...
    // (Dashboard, production, stock, reports, user mgmt, equipment/modal mgmt, etc)
    // Key part to replace: CALENDAR rendering.
  }

  loadCalendar() {
    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const calendarData = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
    const userRole = this.currentUser ? this.currentUser.role : null;

    const d = new Date(this.currentYear, this.currentMonth+1, 0);
    const daysInMonth = d.getDate();
    const monthLabel = document.getElementById('calendar-month-label');
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (monthLabel) monthLabel.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

    // Table headers
    let html = `<table class="equipment-calendar-table"><thead><tr>`;
    html += `<th>Equipment</th>`;
    for (let day=1; day<=daysInMonth; ++day)
      html += `<th>${day}</th>`;
    html += `</tr></thead><tbody>`;

    // Equipment rows
    for (const eq of equipment) {
      const editableClass = userRole === 'superadmin' ? 'editable' : '';
      html += `<tr>`;
      html += `<td class="equipment-name-cell ${editableClass}" 
                  ondblclick="${userRole==='superadmin' ? `window.pharmaApp.editEquipmentName(${eq.id})`:``}" 
                  title="${userRole==='superadmin' ? 'Double click to edit name':''}">${eq.name}</td>`;
      for (let day=1; day<=daysInMonth; ++day) {
        const cellKey = `${eq.id}-${this.currentYear}-${this.currentMonth}-${day}`;
        const cell = calendarData.find(x=>x.key===cellKey);
        let cls='calendar-cell';
        if(cell) cls += ` ${cell.type}`;
        html += `<td class="${cls}" title="${cell?cell.type.charAt(0).toUpperCase()+cell.type.slice(1):'Edit'}"
          onclick="window.pharmaApp.editCalendarCell('${eq.id}','${day}')">
          ${cell ? `
              <div class="batch-info">${cell.batchInfo || ''}</div>
              <div class="batch-notes">${cell.notes || ''}</div>
          ` : ``}
        </td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;
    document.getElementById("equipment-calendar").innerHTML = html;
  }

  // ... Rest of the application code, as in prior answers: 
  // changeMonth(), editEquipmentName(), editCalendarCell(), 
  // plus all modal and CRUD logic unchanged ...
  changeMonth(dir) {
    this.currentMonth += dir;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.loadCalendar();
  }

  editEquipmentName(id) {
    if (!this.currentUser || this.currentUser.role !== 'superadmin') return;
    const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
    const eq  = equipment.find(e=>e.id == id);
    if (!eq) return;
    const newName = prompt('Edit equipment name:', eq.name);
    if (newName && newName.trim() && newName.trim() !== eq.name) {
      eq.name = newName.trim();
      localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
      this.loadCalendar();
      this.showToast('Equipment name updated', 'success');
    }
  }

  // (The rest of your app methods)
}

window.pharmaApp = new PharmaPlanningApp();
