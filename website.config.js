const config = {
	SEO: {
		titleTemplate: "%s | Alessio Franceschi",
		defaultTitle: "Alessio Franceschi",
		description: "Personal Blog on Programming",
		openGraph: {
			type: "website",
			locale: "it_IT",
			url: "https://alessiofranceschi.dev",
			site_name: "Alessio Franceschi",
			description: "Personal Blog on Programming",
			images: [
				{
					url: "/favicon.png",
				},
			],
		},
		twitter: {
			handle: "@PandaSekh",
			site: "@PandaSekh",
			cardType: "summary",
		},
		additionalMetaTags: [
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0",
			},
		],
		additionalLinkTags: [
			{
				rel: "icon",
				href: "/favicon.png",
			}
		],
	},
	pages: [
		{
			title: "Projects",
			url: "/projects",
		},
		{
			title: "About",
			url: "/about",
		},
	],
	social: {
		github: {
			name: "GitHub",
			icon: "github",
			url: "https://www.github.com/pandasekh",
		},
		twitter: {
			name: "Twitter",
			icon: "twitter",
			url: "https://twitter.com/PandaSekh",
		},
		devto: {
			name: "DevTo",
			icon: "devto",
			url: "https://dev.to/pandasekh",
		},
		linkedin: {
			name: "LinkedIn",
			icon: "linkedin",
			url: "https://www.linkedin.com/in/alessio-franceschi/",
		},
	},
};

export default config;
