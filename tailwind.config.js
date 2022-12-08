/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {},
  plugins: [
    require('@headlessui/tailwindcss'),
    require('@tailwindcss/forms')
  ],
};
