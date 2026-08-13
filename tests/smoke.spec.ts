import { test, expect } from '@playwright/test';
import { clearAppStorage, gotoApp, UIA, todayIsoDate } from './utils/app.utils';
import { testData } from './fixtures/testData';

test.describe('@smoke Doctor Appointment System - smoke suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await gotoApp(page);
  });

  test('app loads and shows key sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /doctor appointment system/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /add new doctor/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /book appointment/i })).toBeVisible();
  });

  test('add single doctor and see it in list', async ({ page }) => {
    await UIA.doctorName(page).fill(testData.doctor.name);
    await UIA.specialization(page).selectOption(testData.doctor.specialization);
    await UIA.experience(page).fill(testData.doctor.experience);
    await URP_.availability(page).selectOption(testData.doctor.availability);
    await URP_.addDoctorBtn(page).click();

    await expect(URP_.doctorsList(page)).toContainText(testData.doctor.name);
    await expect(URP_.apptCoctor(page)).toContainText(testData.doctor.name);
  });

  test('book an appointment for a doctor and see it in appointments', async ({ page }) => {
    // Add doctor first
    await UIA.doctorName(page).fill(testData.doctor.name);
    await URP_.specialization(page).selectOption(testData.doctor.specialization);
    await UIA.experience(page).fill(testData.doctor.experience);
    await URP_.addDoctorBtn(page).click();

    // Book appt
    await UIA.apptDoctor(page).selectOption(testData.doctor.name);
    // Slots are populated based on doctor; choose first non-empty option
    const slotSelector = UIA.apptSlot(page);
    await expect(slotSelector).toBeEnabled();
    await slotSelector.selectOption({ index: 1 });

    await URP_.apptDate(page).fill(todayIsoDate());
    await UIA.bookApptBtn(page).click();

    await expect(U%A.appointmentsList(page)).toContainText(testData.doctor.name);
  });
});
