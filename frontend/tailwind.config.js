/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#8B5CF6", // Example primary color
                secondary: "#1F2937",
            }
        },
    },
    plugins: [],
}
