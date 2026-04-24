const createStarterMermaidDiagram = () => ({
  type: "codeBlock",
  attrs: {
    language: "mermaid",
  },
  content: [
    {
      type: "text",
      text: "flowchart TD\nA[Mermaid] --> B{You know syntax?}\nB -->|Yes| C[Cool!]\nB -->|No| D[Try it!]",
    },
  ],
});

const createStarterPlantUmlDiagram = () => ({
  type: "codeBlock",
  attrs: {
    language: "plantuml",
  },
  content: [
    {
      type: "text",
      text: "@startuml\nBob -> Alice : hello\n@enduml",
    },
  ],
});

const createStarterSpotifyEmbed = () => ({
  type: "codeBlock",
  attrs: {
    language: "spotify",
  },
  content: [
    {
      type: "text",
      text: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    },
  ],
});

const createStarterYouTubeEmbed = () => ({
  type: "codeBlock",
  attrs: {
    language: "youtube",
  },
  content: [
    {
      type: "text",
      text: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ],
});

export {
  createStarterMermaidDiagram,
  createStarterPlantUmlDiagram,
  createStarterSpotifyEmbed,
  createStarterYouTubeEmbed,
};
