import { PostTypeModel } from "../types/post.types";
import { BlogTypeModel } from "./../types/blog.types";

export const db = {
  blogs: <BlogTypeModel[]>[
    {
      id: "1",
      name: "JavaScript Basics",
      description:
        "A beginner-friendly course covering the basics of JavaScript.",
      websiteUrl: "https://learn-js.dev",
    },
    {
      id: "2",
      name: "Node.js API",
      description:
        "Documentation and tutorials for building REST APIs with Node.js.",
      websiteUrl: "https://nodeapi.io",
    },
    {
      id: "3",
      name: "Frontend Samurai",
      description:
        "Community and resources for frontend developers mastering React and TypeScript.",
      websiteUrl: "https://frontsamurai.com",
    },
  ],

  posts: <PostTypeModel[]>[
    {
      id: "101",
      title: "Getting Started with TypeScript",
      shortDescription:
        "Why TypeScript makes JavaScript development safer and faster.",
      content:
        "TypeScript is a strongly typed superset of JavaScript that compiles to plain JS. It provides static typing, interfaces, generics, and more.",
      blogId: "1",
      blogName: "JavaScript Basics",
    },
    {
      id: "102",
      title: "Building REST APIs with Express",
      shortDescription: "Step-by-step guide to creating your first REST API.",
      content:
        "Express is a minimal and flexible Node.js web application framework. It provides a robust set of features for building APIs quickly.",
      blogId: "2",
      blogName: "Node.js API",
    },
    {
      id: "103",
      title: "React vs Vue in 2025",
      shortDescription:
        "A fair comparison of the two most popular frontend frameworks.",
      content:
        "React and Vue both excel in different areas. React has a larger ecosystem, while Vue focuses on simplicity and fast learning curve.",
      blogId: "3",
      blogName: "Frontend Samurai",
    },
  ],
};
