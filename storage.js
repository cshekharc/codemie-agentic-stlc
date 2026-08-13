const KEYS = {
  DOCTORS: 'codemie_stlc/doctors',
  APPOINTMENTS: 'codemie_stlc/appointments',
  META: 'codemie_stlc/meta',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  loadDoctors: () => loadJSON(KEYS.DOCTORS, null),
  saveDoctors: (doctors) => saveJSON(KEYS.DOCTORS, doctors),
  loadAppointments: () => loadJSON(KEYS.APPOINTMENTS, []),
  saveAppointments: (appts) => saveJSON(KEYS.APPOINTMENTS, appts),
  loadMeta: () => loadJSON(KEYS.META, { nextId: 1 }),
  saveMeta: (meta) => saveJSON(KEYS.META, meta),
  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
