import type { Page } from '@playwright/test';

/**
 * The app persists state to localStorage. To keep tests deterministic,
 * we clear any prior run state before each test.
 */
export async function clearAppStorage(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
    } catch (err) {
      // If localStorage is restricted/disabled, we don't fail test setup.
    }
  });
 }

export async function gotoApp(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /doctor appointment system/i }).first().waitFor();
}

/** Prefer to drive the UI via accessible roles and labels. */
export const UI = {
  resetDemoBtn: (page: Page) => page.getByRole('button', { name: /reset demo data/i }),
  addDoctorBtn: (page: Page) => page.getByRole('button', { name: /add doctor/i }),
  cancelEditBtn: (page: Page) => page.getByRole('button', { name: /cancel/i }),
  clearFormBtn: (page: Page) => page.getByRole('button', { name: /clear/i }),
  bookApptBtn: (page: Page) => page.getByRole('button', { name: /book appointment/i }),
  doctorName: (page: Page) => page.getByLabel(/doctor name/i),
  specialization: (page: Page) => page.getByLabel(/specialization/i),
  experience: (page: Page) => page.getByLabel(/experience/i),
  availability: (page: Page) => page.getByLabel(/availability/i),
  apptDoctor: (page: Page) => page.getByLabel(/doctor:/i),
  apptSlot: (page: Page) => page.getByLabel(/time slot:/i),
  apptDate: (page: Page) => page.getByLabel(/date:/i),
  doctorsList: (page: Page) => page.locator('#doctorsList'),
  appointmentsList: (page: Page) => page.locator('#appointmentsList'),
  doctorSectionTitle: (page: Page) => page.locator('#doctorSectionTitle'),
  doctorFormError: (page: Page) => page.locator('#doctorFormError'),
  apptFormError: (page: Page) => page.locator('#apptFormError'),
  modal: (page: Page) => page.locator('#confirmModal'),
  modalConfirm: (page: Page) => page.locator('#modalConfirmBtn'),
  modalCancel: (page: Page) => page.locator('#modalCancelBtn'),
};

/** Returns today in YYYY-MM-DD (the format <input type=date> expects). */
export function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
