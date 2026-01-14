/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b", // Azul pizarra oscuro (Sidebar)
        secondary: "#64748b", // Gris pizarra
        accent: "#2563eb", // Azul brillante (Botones y Activos)
      }
    },
  },
  plugins: [],
}