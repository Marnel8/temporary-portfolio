import { Icons } from "@/components/icons";
import { HomeIcon } from "lucide-react";

export const DATA = {
	name: "Marnel Valentin",
	initials: "MV",
	url: "https://marnelvalentin.com",
	location: "Mamburao, Occidental Mindoro",
	locationLink:
		"https://www.google.com/maps/place/Mamburao,+Occidental+Mindoro",
	description:
		"Web Developer with a passion for creating innovative solutions and assisting others.",
	summary:
		"I am Mhar Nhel Valentin, a 24-year-old web developer with a Bachelor of Science in Information Technology. My expertise lies in developing software, particularly websites. As a versatile and quick learner, I've honed my skills in various web technologies and frameworks. My passion for coding and problem-solving drives me to continuously expand my knowledge and take on new challenges in the ever-evolving field of web development.",
	avatarUrl: "/me.png",
	skills: [
		"React",
		"React Native",
		"Next.js",
		"JavaScript",
		"Typescript",
		"Node.js",
		"Python",
		"PostgreSQL",
		"MySQL",
		"MongoDB",
		"Firebase",
		"Appwrite",
		"Docker",
		"NGINX",
		"Apache",
		"PHP",
		"Redux",
		"Zustand",
		"Tanstack Query",
		"Figma",
		"Photoshop",
		"MS Office Suite",
	],
	navbar: [{ href: "/", icon: HomeIcon, label: "Home" }],
	contact: {
		email: "mharnhelvalentin@gmail.com",
		phone: "+639664739469",
		social: {
			GitHub: {
				name: "GitHub",
				url: "https://github.com/marnel8",
				icon: Icons.github,

				navbar: true,
			},
			LinkedIn: {
				name: "LinkedIn",
				url: "https://www.linkedin.com/in/mharnhel-valentin",
				icon: Icons.linkedin,

				navbar: true,
			},
			X: {
				name: "X",
				url: "https://x.com/Tiomarrr?t=UjTLciFjOHQV_AkYLt-bhg&s=09&fbclid=IwY2xjawGHX91leHRuA2FlbQIxMAABHW3NzRniFxZG9J_JUAqc6IEGqeB9vkkd01iQiyAKGDeUiPimUhtx9SQtgQ_aem_Z8fZn-jBldHQGxTq1_zMgQ&mx=2",
				icon: Icons.x,

				navbar: true,
			},
			Facebook: {
				name: "Facebook",
				url: "https://web.facebook.com/Marnel.Valentin.02/",
				icon: Icons.facebook,
				navbar: true,
			},
			email: {
				name: "Send Email",
				url: "#",
				icon: Icons.email,

				navbar: false,
			},
		},
	},

	work: [
		{
			company: "Batangas State University - DTC Intern",
			href: "https://batstateu.edu.ph/",
			badges: [],
			location: "Alangilan, Batangas City, Batangas",
			title: "Software Developer Intern",
			logoUrl: "/batstateu_logo.png",
			start: "Feb 2023",
			end: "May 2023",
			description:
				"Developed a frontend user interface for Web and Mobile Projects of the Digital Transformation Center (DTC) and collaborate with the other intern and staffs.",
		},
		{
			company: "Freelance",
			badges: [],
			href: "",
			location: "Remote",
			title: "Web Developer",
			logoUrl: "/code.png",
			start: "October 2023",
			end: "Present",
			description:
				"Developed and deployed various full-stack web applications for clients using modern technologies. Implemented responsive front-end designs with React and Next.js, built robust back-end APIs using Node.js and Express, and integrated PostgreSQL databases. Utilized Git for version control and deployed applications on cloud platforms like Vercel and Heroku.",
		},
		{
			company: "MPMPC",
			badges: [],
			href: "",
			location: "Mamburao, Occidental Mindoro",
			title: "Layout Artist",
			logoUrl: "/mpmpc.jpg",
			start: "October 2023",
			end: "November 2024",
			description:
				"Design and Layout Posters, Flyers, and other promotional materials for the Mindoro Progressive Multi-Purpose Cooperative (MPMPC).",
		},
		{
			company: "Batangas State University - STEERHUB",
			href: "https://batstateu.edu.ph/",
			badges: [],
			location: "Alangilan, Batangas City, Batangas",
			title: "University Research Associate I (Full Stack Web Developer)",
			logoUrl: "/batstateu_logo.png",
			start: "November 2024",
			end: "September 2025",
			description:
				"Leading full-stack development for Batangas State University's STEERHUB platform, supporting the TRIOE initiative in research collaboration and resource management.",
		},
	],
	education: [
		{
			school: "Batangas State University - TNEU",
			href: "https://batstateu.edu.ph/",
			degree: "Bachelor of Science in Information Technology",
			logoUrl: "/batstateu_logo.png",
			start: "2019",
			end: "2023",
		},
	],
	projects: [
		{
			title: "BatStateU RMS",
			href: "",
			dates: "Feb 2023 - May 2023",
			active: false,
			description:
				"Efficiently explore, publish, and manage diverse research papers on a streamlined web platform for comprehensive research management.",
			technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
			links: [
				{
					type: "Source",
					href: "ps://github.com/gitcommit222/new-rms-webdev",
					icon: <Icons.github className="size-3" />,
				},
			],
			image: "/batstateuproj.png",
			video: "",
		},
		{
			title: "TODDS",
			href: "",
			dates: "October 2023 - January 2023",
			active: false,
			description:
				"Collaborate with RakSquad Company to create a full stack MERN application for their client.",
			technologies: ["Next.js", "MongoDB", "Mongoose", "TailwindCSS", "Redux"],
			links: [
				{
					type: "Website",
					href: "",
					icon: <Icons.globe className="size-3" />,
				},
			],
			image: "/todds.png",
			video: "",
		},
		{
			title: "Metamorphose AI",
			href: "https://metamorphose-fcvnu3je6-gitcommit222s-projects.vercel.app/",
			dates: "Jan 2024 - Feb 2024",
			active: true,
			description:
				"A full stack Software-as-a-Service(SaaS) application that features photo manipulation with artificial intelligence API",
			technologies: [
				"Next.js",
				"Typescript",
				"MongoDB",
				"Mongoose",
				"TailwindCSS",
				"Stripe",
				"Shadcn UI",
				"Clerk",
			],
			links: [
				{
					type: "Website",
					href: "https://metamorphose-fcvnu3je6-gitcommit222s-projects.vercel.app/",
					icon: <Icons.globe className="size-3" />,
				},
				{
					type: "Source",
					href: "https://github.com/gitcommit222/metamorphose.ai",
					icon: <Icons.github className="size-3" />,
				},
			],
			image: "/meta.png",
			video: "",
		},
		{
			title: "Paluan Tour",
			href: "",
			dates: "August 2024 - October 2024",
			active: false,
			description:
				"A comprehensive 3 user web application the aims to track the progress and status of all tourist spots in Paluan, Occidental Mindoro.",
			technologies: [
				"Next.js",
				"MySQL",
				"Sequelize",
				"TailwindCSS",
				"Flowbite React",
				"Tanstack Query",
			],
			links: [
				{
					type: "Source",
					href: "https://github.com/gitcommit222/paluan-tour-monitoring",
					icon: <Icons.github className="size-3" />,
				},
				{
					type: "Website",
					href: "https://paluan-tour.vercel.app/",
					icon: <Icons.globe className="size-3" />,
				},
			],
			image: "/Paluan_LANDING.png",
			video: "",
		},
		{
			title: "BatStateU Marketplace",
			href: "http://198.177.125.118/marketplace",
			dates: "December 2024 - January 2025",
			active: false,
			description:
				"A web application that allows users to buy and sell items on the Batangas State University campus.",
			technologies: [
				"Next.js",
				"MySQL",
				"Sequelize",
				"TailwindCSS",
				"Shadcn UI",
				"Tanstack Query",
				"Typescript",
			],
			links: [
				{
					type: "Website",
					href: "http://198.177.125.118/marketplace",
					icon: <Icons.globe className="size-3" />,
				},
			],
			image: "/bsu-marketplace.png",
			video: "",
		},
		{
			title: "TRIOE",
			href: "http://trioe.dev",
			dates: "November 2024 - Present",
			active: false,
			description:
				"A website platform for the Batangas State University's TRIOE initiative.",
			technologies: [
				"Next.js 15",
				"MySQL",
				"Sequelize",
				"TailwindCSS",
				"Shadcn UI",
				"Tanstack Query",
				"Typescript",
			],
			links: [
				{
					type: "Website",
					href: "http://trioe.dev",
					icon: <Icons.globe className="size-3" />,
				},
			],
			image: "",
			video: "/trioe.mp4",
		},
		{
			title: "Mhar - AI Agent Web Extension",
			href: "",
			dates: "April 2025 - Present",
			active: false,
			description:
				"A web extension that allows users to interact with AI agents on any website.",
			technologies: ["HTML", "CSS", "Javascript", "Ollama", "Llama 3.2"],
			links: [
				{
					type: "Source",
					href: "https://github.com/Marnel8/oracle",
					icon: <Icons.github className="size-3" />,
				},
			],
			image: "",
			video: "/mhar.mp4",
		},
		{
			title: "Malinta Connect",
			href: "https://malinta-connect.vercel.app/",
			dates: "May 2025 - Present",
			active: false,
			description:
				"A web platform for Barangay Malinta residents to report issues and for officials to track their progress.",
			technologies: ["Next.js", "TailwindCSS", "Shadcn UI", "Firebase"],
			links: [
				{
					type: "Source",
					href: "https://github.com/Marnel8/malinta-connect",
					icon: <Icons.github className="size-3" />,
				},
				{
					type: "Website",
					href: "https://malinta-connect.vercel.app/",
					icon: <Icons.globe className="size-3" />,
				},
			],
			image: "",
			video: "/malinta.mp4",
		},
	],
	hackathons: [
		{
			title: "Hack Western 5",
			dates: "November 23rd - 25th, 2018",
			location: "London, Ontario",
			description:
				"Developed a mobile application which delivered bedtime stories to children using augmented reality.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-western.png",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
			links: [],
		},
		{
			title: "Hack The North",
			dates: "September 14th - 16th, 2018",
			location: "Waterloo, Ontario",
			description:
				"Developed a mobile application which delivers university campus wide events in real time to all students.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-north.png",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
			links: [],
		},
		{
			title: "FirstNet Public Safety Hackathon",
			dates: "March 23rd - 24th, 2018",
			location: "San Francisco, California",
			description:
				"Developed a mobile application which communcicates a victims medical data from inside an ambulance to doctors at hospital.",
			icon: "public",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/firstnet.png",
			links: [],
		},
		{
			title: "DeveloperWeek Hackathon",
			dates: "February 3rd - 4th, 2018",
			location: "San Francisco, California",
			description:
				"Developed a web application which aggregates social media data regarding cryptocurrencies and predicts future prices.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/developer-week.jpg",
			links: [
				{
					title: "Github",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/cryptotrends/cryptotrends",
				},
			],
		},
		{
			title: "HackDavis",
			dates: "January 20th - 21st, 2018",
			location: "Davis, California",
			description:
				"Developed a mobile application which allocates a daily carbon emission allowance to users to move towards a sustainable environment.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-davis.png",
			win: "Best Data Hack",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2018/white.svg",
			links: [
				{
					title: "Devpost",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://devpost.com/software/my6footprint",
				},
				{
					title: "ML",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/Wallet6/my6footprint-machine-learning",
				},
				{
					title: "iOS",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/Wallet6/CarbonWallet",
				},
				{
					title: "Server",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/Wallet6/wallet6-server",
				},
			],
		},
		{
			title: "ETH Waterloo",
			dates: "October 13th - 15th, 2017",
			location: "Waterloo, Ontario",
			description:
				"Developed a blockchain application for doctors and pharmacists to perform trustless transactions and prevent overdosage in patients.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/eth-waterloo.png",
			links: [
				{
					title: "Organization",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/ethdocnet",
				},
			],
		},
		{
			title: "Hack The North",
			dates: "September 15th - 17th, 2017",
			location: "Waterloo, Ontario",
			description:
				"Developed a virtual reality application allowing users to see themselves in third person.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-north.png",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
			links: [
				{
					title: "Streamer Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/justinmichaud/htn2017",
				},
				{
					title: "Client Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/RTSPClient",
				},
			],
		},
		{
			title: "Hack The 6ix",
			dates: "August 26th - 27th, 2017",
			location: "Toronto, Ontario",
			description:
				"Developed an open platform for people shipping items to same place to combine shipping costs and save money.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-6ix.jpg",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/ShareShip/ShareShip",
				},
				{
					title: "Site",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://share-ship.herokuapp.com/",
				},
			],
		},
		{
			title: "Stupid Hack Toronto",
			dates: "July 23rd, 2017",
			location: "Toronto, Ontario",
			description:
				"Developed a chrome extension which tracks which facebook profiles you have visited and immediately texts your girlfriend if you visited another girls page.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/stupid-hackathon.png",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/nsagirlfriend/nsagirlfriend",
				},
			],
		},
		{
			title: "Global AI Hackathon - Toronto",
			dates: "June 23rd - 25th, 2017",
			location: "Toronto, Ontario",
			description:
				"Developed a python library which can be imported to any python game and change difficulty of the game based on real time emotion of player. Uses OpenCV and webcam for facial recognition, and a custom Machine Learning Model trained on a [Kaggle Emotion Dataset](https://www.kaggle.com/c/challenges-in-representation-learning-facial-expression-recognition-challenge/leaderboard) using [Tensorflow](https://www.tensorflow.org/Tensorflow) and [Keras](https://keras.io/). This project recieved 1st place prize at the Global AI Hackathon - Toronto and was also invited to demo at [NextAI Canada](https://www.nextcanada.com/next-ai).",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/global-ai-hackathon.jpg",
			win: "1st Place Winner",
			links: [
				{
					title: "Article",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://syncedreview.com/2017/06/26/global-ai-hackathon-in-toronto/",
				},
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/TinySamosas/",
				},
			],
		},
		{
			title: "McGill AI for Social Innovation Hackathon",
			dates: "June 17th - 18th, 2017",
			location: "Montreal, Quebec",
			description:
				"Developed realtime facial microexpression analyzer using AI",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/ai-for-social-good.jpg",
			links: [],
		},
		{
			title: "Open Source Circular Economy Days Hackathon",
			dates: "June 10th, 2017",
			location: "Toronto, Ontario",
			description:
				"Developed a custom admin interface for food waste startup <a href='http://genecis.co/'>Genecis</a> to manage their data and provide analytics.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/open-source-circular-economy-days.jpg",
			win: "1st Place Winner",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/genecis",
				},
			],
		},
		{
			title: "Make School's Student App Competition 2017",
			dates: "May 19th - 21st, 2017",
			location: "International",
			description: "Improved PocketDoc and submitted to online competition",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/make-school-hackathon.png",
			win: "Top 10 Finalist | Honourable Mention",
			links: [
				{
					title: "Medium Article",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://medium.com/make-school/the-winners-of-make-schools-student-app-competition-2017-a6b0e72f190a",
				},
				{
					title: "Devpost",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://devpost.com/software/pocketdoc-react-native",
				},
				{
					title: "YouTube",
					icon: <Icons.youtube className="h-4 w-4" />,
					href: "https://www.youtube.com/watch?v=XwFdn5Rmx68",
				},
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/pocketdoc-react-native",
				},
			],
		},
		{
			title: "HackMining",
			dates: "May 12th - 14th, 2017",
			location: "Toronto, Ontario",
			description: "Developed neural network to optimize a mining process",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-mining.png",
			links: [],
		},
		{
			title: "Waterloo Equithon",
			dates: "May 5th - 7th, 2017",
			location: "Waterloo, Ontario",
			description:
				"Developed Pocketdoc, an app in which you take a picture of a physical wound, and the app returns common solutions or cures to the injuries or diseases.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/waterloo-equithon.png",
			links: [
				{
					title: "Devpost",
					icon: <Icons.globe className="h-4 w-4" />,
					href: "https://devpost.com/software/pocketdoc-react-native",
				},
				{
					title: "YouTube",
					icon: <Icons.youtube className="h-4 w-4" />,
					href: "https://www.youtube.com/watch?v=XwFdn5Rmx68",
				},
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/pocketdoc-react-native",
				},
			],
		},
		{
			title: "SpaceApps Waterloo",
			dates: "April 28th - 30th, 2017",
			location: "Waterloo, Ontario",
			description:
				"Developed Earthwatch, a web application which allows users in a plane to virtually see important points of interest about the world below them. They can even choose to fly away from their route and then fly back if they choose. Special thanks to CesiumJS for providing open source world and plane models.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/space-apps.png",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/earthwatch",
				},
			],
		},
		{
			title: "MHacks 9",
			dates: "March 24th - 26th, 2017",
			location: "Ann Arbor, Michigan",
			description:
				"Developed Super Graphic Air Traffic, a VR website made to introduce people to the world of air traffic controlling. This project was built completely using THREE.js as well as a node backend server.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/mhacks-9.png",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/threejs-planes",
				},
			],
		},
		{
			title: "StartHacks I",
			dates: "March 4th - 5th, 2017",
			location: "Waterloo, Ontario",
			description:
				"Developed at StartHacks 2017, Recipic is a mobile app which allows you to take pictures of ingredients around your house, and it will recognize those ingredients using ClarifAI image recognition API and return possible recipes to make. Recipic recieved 1st place at the hackathon for best pitch and hack.",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/starthacks.png",
			win: "1st Place Winner",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
			links: [
				{
					title: "Source (Mobile)",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/mattBlackDesign/recipic-ionic",
				},
				{
					title: "Source (Server)",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/mattBlackDesign/recipic-rails",
				},
			],
		},
		{
			title: "QHacks II",
			dates: "February 3rd - 5th, 2017",
			location: "Kingston, Ontario",
			description:
				"Developed a mobile game which enables city-wide manhunt with random lobbies",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/qhacks.png",
			mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2017/white.svg",
			links: [
				{
					title: "Source (Mobile)",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/dillionverma/human-huntr-react-native",
				},
				{
					title: "Source (API)",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/mattBlackDesign/human-huntr-rails",
				},
			],
		},
		{
			title: "Terrible Hacks V",
			dates: "November 26th, 2016",
			location: "Waterloo, Ontario",
			description:
				"Developed a mock of Windows 11 with interesting notifications and functionality",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/terrible-hacks-v.png",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/justinmichaud/TerribleHacks2016-Windows11",
				},
			],
		},
		{
			title: "Portal Hackathon",
			dates: "October 29, 2016",
			location: "Kingston, Ontario",
			description:
				"Developed an internal widget for uploading assignments using Waterloo's portal app",
			image:
				"https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/portal-hackathon.png",
			links: [
				{
					title: "Source",
					icon: <Icons.github className="h-4 w-4" />,
					href: "https://github.com/UWPortalSDK/crowmark",
				},
			],
		},
	],
	trainings: [
		{
			title: "Basic Software Engineering",
			dates: "Feb 02 2024 - Feb 03 2024",
			location: "Remote (Cast LMS)",
			description:
				"Learned the basics of software engineering and development.",
			image: "/DICT.png",
			links: [
				{
					title: "Certificate",
					icon: <Icons.googleDrive className="h-4 w-4" />,
					href: "https://drive.google.com/file/d/1jFZakc_Tf_HMhbYxVLT_p8SO3Il-h0EV/view?usp=drive_link",
				},
			],
		},
		{
			title: "Intermediate Software Engineering",
			dates: "Feb 07 2024 - Feb 09 2024",
			location: "Remote (DICT Cast LMS)",
			description:
				"Enhanced understanding of software engineering principles and practices, focusing on intermediate-level concepts.",
			image: "/DICT.png",
			links: [
				{
					title: "Certificate",
					icon: <Icons.googleDrive className="h-4 w-4" />,
					href: "https://drive.google.com/file/d/18qIlP0kEF5CbraLRvvBGboudxttCKa89/view?usp=drive_link",
				},
			],
		},
		{
			title: "Advanced Software Engineering",
			dates: "Feb 16 2024 - Feb 18 2024",
			location: "Remote (DICT Cast LMS)",
			description:
				"Mastered advanced software engineering techniques and methodologies, preparing for complex project challenges.",
			image: "/DICT.png",
			links: [
				{
					title: "Certificate",
					icon: <Icons.googleDrive className="h-4 w-4" />,
					href: "https://drive.google.com/file/d/1AlXrfEurvkz_PGnCuABSEwm2wZMQsPGp/view?usp=drive_link",
				},
			],
		},
		{
			title: "Basic level of Cloud Computing",
			dates: "Feb 27 2024 - Mar 01 2024",
			location: "Remote (DICT Cast LMS)",
			description:
				"Acquired foundational knowledge in cloud computing, including cloud service models, deployment strategies, and essential cloud technologies.",
			image: "/DICT.png",
			links: [
				{
					title: "Certificate",
					icon: <Icons.googleDrive className="h-4 w-4" />,
					href: "https://drive.google.com/file/d/1XnVPM2eD4pNTIbtLPRq1OBAtahCEXusy/view?usp=drive_link",
				},
			],
		},
	],
} as const;
