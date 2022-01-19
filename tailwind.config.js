module.exports = {
	purge: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: false, // or 'media' or 'class'
	theme: {
		colors: {
			github: "#24292e",
			linkedin: "#0077b5",
			twitter: "#1da1f2",
			gray: "#a2a2a2",
			black: "#000000",
		},
		extend: {},
	},
	variants: {
		extend: {
			fill: ["hover", "focus", "group-hover"],
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
