import {
  init,
  getDoctors,
  addDoctor,
  updateDoctor,
  removeDoctor,
  getAppointments,
  bookAppointment,
  cancelAppointment,
  resetDemo,
  FIXED_SLOTS,
} from './domain.js';

// ─── UI state ────────────────────────────────────────────────────────────────
let editingDoctorId = null;
let lastFocusedEl = null;
let pendingModalAction = null;

// ─── DOM refs (resolved after DOMContentLoaded) ───────────────────────────────
let doctorSection, doctorSectionTitle, addDoctorBtn, cancelEditBtn;
let doctorFormError, doctorsListEl;
let apptFormError, appointmentsListEl, apptDoctorSelect;
let confirmModal, modalMessageEl, modalConfirmBtn, modalCancelBtn;
let statusAnnouncer;

// ─── Bootstrap ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  doctorSection = document.getElementById('doctorSection');
  doctorSectionTitle = document.getElementById('doctorSectionTitle');
  addDoctorBtn = document.getElementById('addDoctorBtn');
  cancelEditBtn = document.getElementById('cancelEditBtn');
  doctorFormError = document.getElementById('doctorFormError');
  doctorsListEl = document.getElementById('doctorsList');
  apptFormError = document.getElementById('apptFormError');
  appointmentsListEl = document.getElementById('appointmentsList');
  apptDoctorSelect = document.getElementById('apptDoctor');
  confirmModal = document.getElementById('confirmModal');
  modalMessageEl = document.getElementById('modalMessage');
  modalConfirmBtn = document.getElementById('modalConfirmBtn');
  modalCancelBtn = document.getElementById('modalCancelBtn');
  statusAnnouncer = document.getElementById('statusAnnouncer');

  addDoctorBtn.addEventListener('click', handleDoctorFormSubmit);
  cancelEditBtn.addEventListener('click', handleCancelEdit);
  document.getElementById('clearFormBtn').addEventListener('click', clearDoctorForm);
  document.getElementById('bookApptBtn').addEventListener('click', handleBookAppointment);
  document.getElementById('resetDemoBtn').addEventListener('click', handleResetDemo);

  modalConfirmBtn.addEventListener('click', () => {
    if (pendingModalAction) pendingModalAction();
    closeModal();
  });
  modalCancelBtn.addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !confirmModal.hidden) closeModal();
  });

  // Populate fixed appointment slots
  const apptSlotSelect = document.getElementById('apptSlot');
  FIXED_SLOTS.forEach((slot) => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    apptSlotSelect.appendChild(opt);
  });

  // Default appointment date to today
  const apptDateInput = document.getElementById('apptDate');
  const today = new Date().toISOString().split('T')[0];
  apptDateInput.value = today;
  apptDateInput.min = today;

  init();
  renderDoctors();
  renderApptDoctorOptions();
  renderAppointments();
});

// ─── Doctor form ──────────────────────────────────────────────────────────────
function readDoctorForm() {
  return {
    name: document.getElementById('doctorName').value.trim(),
    specialization: document.getElementById('specialization').value,
    experience: document.getElementById('experience').value,
    availability: document.getElementById('availability').value,
  };
}

function handleDoctorFormSubmit() {
  const { name, specialization, experience, availability } = readDoctorForm();

  if (!name || !specialization || !experience) {
    showError(doctorFormError, 'Please fill in all fields: Name, Specialization, and Experience.');
    return;
  }
  if (parseInt(experience) < 0) {
    showError(doctorFormError, 'Experience must be 0 or more years.');
    return;
  }
  hideError(doctorFormError);

  const data = { name, specialization, experience: parseInt(experience), availability };

  if (editingDoctorId !== null) {
    updateDoctor(editingDoctorId, data);
    announce(`Doctor "${name}" updated successfully.`);
    exitEditMode();
  } else {
    addDoctor(data);
    announce(`Doctor "${name}" added successfully.`);
  }

  clearDoctorForm();
  renderDoctors();
  renderApptDoctorOptions();
}

function clearDoctorForm() {
  document.getElementById('doctorName').value = '';
  document.getElementById('specialization').value = '';
  document.getElementById('experience').value = '';
  document.getElementById('availability').value = 'active';
  hideError(doctorFormError);
}

function enterEditMode(id) {
  const doctor = getDoctors().find((d) => d.id === id);
  if (!doctor) return;

  editingDoctorId = id;
  document.getElementById('doctorName').value = doctor.name;
  document.getElementById('specialization').value = doctor.specialization;
  document.getElementById('experience').value = doctor.experience;
  document.getElementById('availability').value = doctor.availability;

  doctorSectionTitle.textContent = 'Edit Doctor';
  doctorSection.classList.add('editing');
  addDoctorBtn.textContent = 'Save Changes';
  cancelEditBtn.hidden = false;

  doctorSection.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('doctorName').focus();
}

function handleCancelEdit() {
  exitEditMode();
  clearDoctorForm();
  announce('Edit cancelled.');
}

function exitEditMode() {
  editingDoctorId = null;
  doctorSectionTitle.textContent = 'Add New Doctor';
  doctorSection.classList.remove('editing');
  addDoctorBtn.textContent = 'Add Doctor';
  cancelEditBtn.hidden = true;
}

// ─── Delete flow (modal replaces confirm()) ───────────────────────────────────
function initiateDelete(id) {
  const doctor = getDoctors().find((d) => d.id === id);
  if (!doctor) return;
  openModal(
    `Are you sure you want to delete "${doctor.name}"? This action cannot be undone.`,
    'Delete',
    () => {
      removeDoctor(id);
      if (editingDoctorId === id) exitEditMode();
      announce(`Doctor "${doctor.name}" deleted.`);
      renderDoctors();
      renderApptDoctorOptions();
    },
  );
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
function openModal(message, confirmLabel, action) {
  pendingModalAction = action;
  lastFocusedEl = document.activeElement;
  modalMessageEl.textContent = message;
  modalConfirmBtn.textContent = confirmLabel;
  confirmModal.hidden = false;
  modalCancelBtn.focus();
}

function closeModal() {
  confirmModal.hidden = true;
  pendingModalAction = null;
  if (lastFocusedEl) {
    lastFocusedEl.focus();
    lastFocusedEl = null;
  }
}

// ─── Render doctors ───────────────────────────────────────────────────────────
function renderDoctors() {
  const doctors = getDoctors();
  if (doctors.length === 0) {
    doctorsListEl.innerHTML =
      '<div class="empty-state">No doctors added yet. Add a doctor to get started!</div>';
    return;
  }
  doctorsListEl.innerHTML = doctors
    .map(
      (d) => `
      <div class="doctor-card${d.availability === 'inactive' ? ' inactive' : ''}">
        <h3>${d.availability === 'inactive' ? '🚫 ' : '✓ '}${esc(d.name)}</h3>
        <p><strong>Specialization:</strong> ${esc(d.specialization)}</p>
        <p><strong>Experience:</strong> ${d.experience} years</p>
        <p><strong>Status:</strong>
          <span class="status ${d.availability}">${d.availability.toUpperCase()}</span>
        </p>
        <div class="actions">
          <button class="update" data-action="edit" data-id="${d.id}">Edit</button>
          <button class="delete" data-action="delete" data-id="${d.id}">Delete</button>
        </div>
      </div>`,
    )
    .join('');
}

// Event delegation for doctor card buttons (avoids inline onclick)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.dataset.action === 'edit') enterEditMode(id);
  if (btn.dataset.action === 'delete') initiateDelete(id);
  if (btn.dataset.action === 'cancel-appt') handleCancelAppointment(id);
});

// ─── Appointments ─────────────────────────────────────────────────────────────
function renderApptDoctorOptions() {
  const active = getDoctors().filter((d) => d.availability === 'active');
  apptDoctorSelect.innerHTML =
    '<option value="">Select Doctor</option>' +
    active
      .map((d) => `<option value="${d.id}">${esc(d.name)} — ${esc(d.specialization)}</option>`)
      .join('');
}

function handleBookAppointment() {
  const doctorId = parseInt(apptDoctorSelect.value);
  const slot = document.getElementById('apptSlot').value;
  const date = document.getElementById('apptDate').value;

  if (!doctorId || !slot || !date) {
    showError(apptFormError, 'Please select a doctor, a slot, and a date.');
    return;
  }
  hideError(apptFormError);

  try {
    const appt = bookAppointment({ doctorId, slot, date });
    const doc = getDoctors().find((d) => d.id === appt.doctorId);
    announce(`Appointment booked with ${doc ? doc.name : 'doctor'} on ${date} at ${slot}.`);
    renderAppointments();
  } catch (err) {
    showError(apptFormError, err.message);
  }
}

function handleCancelAppointment(id) {
  cancelAppointment(id);
  announce('Appointment cancelled.');
  renderAppointments();
}

function renderAppointments() {
  const appts = getAppointments();
  if (appts.length === 0) {
    appointmentsListEl.innerHTML =
      '<div class="empty-state">No appointments booked yet.</div>';
    return;
  }
  appointmentsListEl.innerHTML = appts
    .map((a) => {
      const doc = getDoctors().find((d) => d.id === a.doctorId);
      const name = doc ? esc(doc.name) : 'Unknown Doctor';
      return `
        <div class="appointment-row${a.status === 'canceled' ? ' canceled' : ''}">
          <div class="appointment-info">
            <strong>${name}</strong> &middot; ${esc(a.slot)} &middot; ${esc(a.date)}
          </div>
          <span class="appt-status ${a.status}">${a.status.toUpperCase()}</span>
          ${a.status === 'booked'
          ? `<button class="cancel-appt" data-action="cancel-appt" data-id="${a.id}">Cancel</button>`
          : ''}
        </div>`;
    })
    .join('');
}

// ─── Reset demo ───────────────────────────────────────────────────────────────
function handleResetDemo() {
  openModal(
    'Reset all demo data? This will restore the default doctors and clear all appointments.',
    'Reset',
    () => {
      resetDemo();
      exitEditMode();
      clearDoctorForm();
      announce('Demo data has been reset.');
      renderDoctors();
      renderApptDoctorOptions();
      renderAppointments();
    },
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function showError(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}

function hideError(el) {
  el.textContent = '';
  el.hidden = true;
}

function announce(msg) {
  // Clear first so repeated identical messages still trigger aria-live
  statusAnnouncer.textContent = '';
  requestAnimationFrame(() => {
    statusAnnouncer.textContent = msg;
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
