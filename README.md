<div align="center">
  <br />
    <a href="#" target="_blank">
      <img src="https://github.com/adrianhajdin/social_media_app/assets/151519281/be514a19-3cbb-48b7-9acd-2cf4d2e319c4" alt="Project Banner">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React_JS-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="react.js" />
    <img src="https://img.shields.io/badge/-Spring_Boot-black?style=for-the-badge&logoColor=white&logo=springboot&color=6DB33F" alt="springboot" />
    <img src="https://img.shields.io/badge/-Java-black?style=for-the-badge&logoColor=white&logo=openjdk&color=ED8B00" alt="java" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-React_Query-black?style=for-the-badge&logoColor=white&logo=reactquery&color=FF4154" alt="reactquery" />
    <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
  </div>

  <h3 align="center">A Full-Stack Social Media Application</h3>

   <div align="center">
     Inspired by the UI from JavaScript Mastery, but completely re-engineered with a <b>Custom Java Spring Boot Backend</b> by me!
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🕸️ [Snippets](#snippets)
6. 🔗 [Links](#links)

## <a name="introduction">🤖 Introduction</a>

Explore social media with this user-friendly platform that has a nice look and lots of features. Easily create and explore posts, and enjoy a strong authentication system and quick data fetching using React Query for a smooth user experience.

*🚀 Architecture Update:* Originally based on a BaaS (Appwrite), this project has been significantly upgraded. I have built and integrated a fully custom *Java Spring Boot Backend* to handle robust relational data, custom API endpoints, authentication, and file storage independently.

## <a name="tech-stack">⚙️ Tech Stack</a>

*Frontend:*
- React.js
- TypeScript
- React Query (Tanstack Query)
- Shadcn UI
- Tailwind CSS

*Backend:*
- Java
- Spring Boot
- Spring Data JPA / Hibernate
- MySQL (or respective Relational Database)
- Custom Local/Cloud File Storage System

## <a name="features">🔋 Features</a>

👉 Custom Spring Boot Backend: Completely migrated from BaaS (Appwrite) to a custom RESTful API built with Java Spring Boot.

👉 Authentication System: A robust authentication system ensuring security and user privacy.

👉 Explore Page: Homepage for users to explore posts, with a featured section for top creators.

👉 Like, Save & Follow Functionality: Enable users to like and save posts, with dedicated pages for managing content, along with a custom *Follow/Unfollow* real-time user relation system.

👉 Detailed Post Page: A detailed post page displaying content and related posts for an immersive user experience.

👉 Profile Page: A user profile page showcasing liked posts, follower/following counts, and providing options to edit the profile.

👉 Create & Edit Post: Implement a user-friendly create/edit post page with effortless custom file upload management and storage mapped to the backend.

👉 Responsive UI with Bottom Bar: A responsive UI with a bottom bar, enhancing the mobile app feel for seamless navigation.

👉 React Query Integration: Incorporate the React Query (Tanstack Query) data fetching library for auto-caching to enhance performance, parallel queries for efficient data retrieval, and first-class mutations.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the frontend project locally on your machine.

Prerequisites

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- A running instance of the Spring Boot Backend API.

Cloning the Repository

```bash
git clone [https://github.com/your-username/snapgram-frontend.git](https://github.com/your-username/snapgram-frontend.git)
cd snapgram-frontend

Installation

Install the project dependencies using npm:

Bash
npm install
Set Up Environment Variables

Create a new file named .env or .env.local in the root of your project and add the following content to link it to your Spring Boot server:

Code snippet
VITE_BACKEND_URL=http://localhost:8080
Running the Project

Bash
npm run dev
Open http://localhost:5173 in your browser to view the project.

<a name="snippets">🕸️ Snippets</a>
<details>
<summary><code>constants/index.ts</code></summary>

TypeScript
export const sidebarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/all-users",
    label: "People",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create Post",
  },
];

export const bottombarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create",
  },
];
</details>

<details>
<summary><code>queryKeys.ts</code></summary>

TypeScript
export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",

  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",

  //  SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",
}
</details>

<details>
<summary><code>types/index.ts</code></summary>

TypeScript
export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};
</details>

<details>
<summary><code>lib/utils.ts</code></summary>

TypeScript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return ${formattedDate} at ${time};
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return ${Math.floor(diffInDays)} day ago;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return ${Math.floor(diffInDays)} days ago;
    case Math.floor(diffInHours) >= 1:
      return ${Math.floor(diffInHours)} hours ago;
    case Math.floor(diffInMinutes) >= 1:
      return ${Math.floor(diffInMinutes)} minutes ago;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};
