import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/** PrimeNG tokens aligned with the existing Student Management blue palette. */
export const StudentManagementTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e7f3f8',
      100: '#d9edf5',
      200: '#b9dce8',
      300: '#9bcede',
      400: '#65c3df',
      500: '#3e88ab',
      600: '#326c8c',
      700: '#28566d',
      800: '#1d3b4b',
      900: '#173646',
      950: '#10242e'
    }
  }
});
