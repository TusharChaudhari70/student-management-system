// Production build configuration for the local Docker deployment.
// The browser reaches the mapped Spring Boot port on the host machine.
export const environment = {
  production: true,
  apiBaseUrl: 'https://student-management-api-zimk.onrender.com'
};
