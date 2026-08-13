import { storage } from './storage.js';

const DEFAULT_DOCTORS = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialization: 'Cardiology', experience: 12, availability: 'active' },
  { id: 2, name: 'Dr. Priya Singh', specialization: 'Dermatology', experience: 8, availability: 'active' },
  { id: 3, name: 'Dr. Arjun Patel', specialization: 'Neurology', experience: 15, availability: 'inactive' },
  { id: 4, name: 'Dr. Meera Nair', specialization: 'Orthopedics', experience: 10, availability: 'active' },
];

export const FIXED_SLOTS = [
  '09:00 - 09:30',
  '10:00 - 10:30',
  '11:00 - 11:30',
  '14:00 - 14:30',
  '15:00 - 15:30',
  '16:00 - 16:30',
];

let doctors = [];
let appointments = [];
let meta = { nextId: 1 };

export function init() {
  const saved = storage.loadDoctors();
  doctors = saved !== null ? saved : DEFAULT_DOCTORS.map((d) => ({ ...d }));
  appointments = storage.loadAppointments();
  meta = storage.loadMeta();

  const maxId = [...doctors.map((d) => d.id), ...appointments.map((a) => a.id)].reduce(
    (m, id) => Math.max(m, id),
    0,
  );
  if (meta.nextId <= maxId) {
    meta.nextId = maxId + 1;
    storage.saveMeta(meta);
  }
}

function nextId() {
  const id = meta.nextId++;
  storage.saveMeta(meta);
  return id;
}

// --- Doctors ---

export function getDoctors() {
  return doctors;
}

export function addDoctor(data) {
  const doctor = { id: nextId(), ...data };
  doctors.push(doctor);
  storage.saveDoctors(doctors);
  return doctor;
}

export function updateDoctor(id, data) {
  const idx = doctors.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Doctor not found');
  doctors[idx] = { ...doctors[idx], ...data };
  storage.saveDoctors(doctors);
  return doctors[idx];
}

export function removeDoctor(id) {
  doctors = doctors.filter((d) => d.id !== id);
  storage.saveDoctors(doctors);
}

// --- Appointments ---

export function getAppointments() {
  return appointments;
}

export function bookAppointment(data) {
  const doctor = doctors.find((d) => d.id === data.doctorId);
  if (!doctor || doctor.availability === 'inactive') {
    throw new Error('Cannot book an appointment with an inactive doctor.');
  }
  const conflict = appointments.find(
    (a) =>
      a.doctorId === data.doctorId &&
      a.slot === data.slot &&
      a.date === data.date &&
      a.status !== 'canceled',
  );
  if (conflict) {
    throw new Error('This slot is already booked for the selected doctor and date.');
  }
  const appt = { id: nextId(), status: 'booked', ...data };
  appointments.push(appt);
  storage.saveAppointments(appointments);
  return appt;
}

export function cancelAppointment(id) {
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Appointment not found');
  appointments[idx] = { ...appointments[idx], status: 'canceled' };
  storage.saveAppointments(appointments);
}

export function resetDemo() {
  storage.reset();
  doctors = DEFAULT_DOCTORS.map((d) => ({ ...d }));
  appointments = [];
  meta = { nextId: 5 };
  storage.saveDoctors(doctors);
  storage.saveAppointments(appointments);
  storage.saveMeta(meta);
}
