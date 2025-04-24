import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  noIndex: true,
  title: "UDhZ 2025 - Bewerbung Rössing",
  tagline:
    'Bewerbung von Rössing für den Wettbewerb "Unser Dorf hat Zukunft" 2025 - Regional- und Landesentscheid',
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://unser-dorf-hat-zukunft.rössing.de",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "levino", // Usually your GitHub org/user name.
  projectName: "unser-dorf-hat-zukunft", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "de",
    locales: ["de"],
  },

  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          path: "unterlagen",
          routeBasePath: "/",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/levino/unser-dorf-hat-zukunft/tree/main/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "UDhZ 2025 - Bewerbung Rössing",
      logo: {
        alt: "Die Drei Eichen",
        src: "img/logo.jpg",
      },
      items: [],
    },
    footer: {
      style: "dark",
      links: [],
      copyright:
        `Nur für Leute, die beim Wettbewerb "Unser Dorf hat Zukunft" für Rössing mithelfen.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
