const SEO = {
  title: "fylepad - a notepad of your dreams!",
  titleTemplate: "%s",

  meta: [
    {
      charset: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },

    {
      name: "title",
      content: "fylepad - a notepad of your dreams!",
    },
    {
      name: "description",
      content:
        "fylepad is an offline-first markdown workspace with AI integration and rich editing features.",
    },
    {
      name: "keywords",
      content:
        "markdown editor, offline notes app, obsidian alternative, markdown workspace, AI notes app, note taking app, tauri, nuxt apps, markdown with AI, markdown with diagrams, markdown with cloud sync, aesthetic markdown editor",
    },
    {
      name: "author",
      content: "Naveed Azhar",
    },

    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "googlebot",
      content: "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
    },

    {
      name: "theme-color",
      content: "#4949a7",
    },

    // Open Graph (Facebook, Discord, LinkedIn)
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://fylepad.app",
    },
    {
      property: "og:title",
      content: "fylepad - a notepad of your dreams!",
    },
    {
      property: "og:description",
      content:
        "fylepad is an offline-first markdown workspace with AI integration and rich editing features.",
    },
    {
      property: "og:image",
      content: "https://fylepad.app/og-image.png",
    },
    {
      property: "og:site_name",
      content: "fylepad",
    },
    {
      property: "og:locale",
      content: "en_US",
    },

    // Twitter Cards
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:url",
      content: "https://fylepad.app",
    },
    {
      name: "twitter:title",
      content: "fylepad - a notepad of your dreams!",
    },
    {
      name: "twitter:description",
      content:
        "fylepad is an offline-first markdown workspace with AI integration and rich editing features.",
    },
    {
      name: "twitter:image",
      content: "https://fylepad.app/og-image.png",
    },

    // App related
    {
      name: "application-name",
      content: "fylepad",
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },

    // Prevent automatic detection
    {
      name: "format-detection",
      content: "telephone=no",
    },
  ],

  // Canonical URL
  link: [
    {
      rel: "canonical",
      href: "https://fylepad.app",
    },

    // Favicon
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },

    // Apple Touch Icon
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
    },
  ],

  // Structured Data
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "fylepad",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Windows, Linux, macOS, Web",
        description:
          "fylepad is an offline-first markdown workspace with AI integration and rich editing tools.",
        url: "https://fylepad.app",
        author: {
          "@type": "Person",
          name: "Naveed Azhar",
        },
      }),
    },
  ],
};

export default SEO;
