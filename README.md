# Developer Tools Hub

This repository houses the code for tools.ryancruz.com, a collection of useful developer tools and utilities. Built with React, Vite, and TailwindCSS, this site provides a set of handy tools for everyday development tasks.

## Available Tools

- **JWT Decoder**: Decode and verify JWT tokens, with a clean interface for examining headers and payloads
- **Mermaid Diagram Viewer**: Live preview for Mermaid diagrams with support for all diagram types

## Technology Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router 6
- **Styling**: TailwindCSS
- **Deployment**: CloudFlare Pages
- **Icons**: Heroicons
- **Dark Mode**: System-aware with user preference persistence
- **Font**: Inter variable font

## Development

First, install dependencies:

```bash
npm install
```

To start the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

## Project Structure

```
tools.ryancruz.com/
├── src/
│   ├── tools/           # Individual tool components
│   │   ├── JWTDecoder.jsx
│   │   └── MermaidViewer.jsx
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles and Tailwind imports
├── public/             # Static assets
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies and scripts
```

## Adding New Tools

1. Create a new component in `src/tools/`
2. Add the route in `App.jsx`
3. Add the tool to the `tools` array in the `ToolsList` component

Example:

```jsx
// src/tools/NewTool.jsx
function NewTool() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Tool</h1>
      {/* Tool implementation */}
    </div>
  );
}

// In App.jsx, add to tools array:
const tools = [
  // ...existing tools
  {
    name: 'New Tool',
    description: 'What this tool does',
    path: '/new-tool',
    icon: '🔧'
  }
];
```

## Performance Considerations

- Tools are lazy-loaded using React.lazy()
- Production builds are optimized with chunk splitting
- Images and assets are optimized during build
- Tailwind's JIT compiler ensures minimal CSS bundle size

## Deployment

The site is automatically deployed via CloudFlare Pages when changes are pushed to the main branch. The build process is configured to:

1. Install dependencies
2. Build the project
3. Deploy to CloudFlare's edge network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please ensure your PR:
- Follows the existing code style
- Includes relevant tests if applicable
- Updates documentation as needed
- Has a clear description of the changes

## License

MIT