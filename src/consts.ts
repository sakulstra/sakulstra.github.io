import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "tl;dr",
  DESCRIPTION: "Too long didn't read.",
  EMAIL: "lukasstrassel@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Welcome on my blog.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "X (formerly Twitter)",
    HREF: "https://twitter.com/sakulstra",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/sakulstra",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/lukas-strassel-172592120/",
  },
  {
    NAME: "Lens",
    HREF: "https://hey.xyz/u/sakulstra",
  },
];
