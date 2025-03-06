# Memory Lane - Thoughtscape Journal

Memory Lane is a minimalist note-taking application designed to capture thoughts effortlessly while enhancing the user experience through thoughtful animations and accessibility features. The app focuses on reducing cognitive load and providing a delightful user experience.

![Memory Lane Logo](https://via.placeholder.com/800x400?text=Memory+Lane)

## Current State

Memory Lane is currently in active development with the following features implemented:

### Core Features

- **Unified Note System**: Create, edit, and view notes in a clean, minimalist interface
- **Floating Modal Editor**: Create and edit notes without losing context using our elegant floating modal
- **Timeline View**: Browse notes chronologically in the main view
- **Map View**: Visualize notes geographically with location-based context
- **Graph View**: (Placeholder UI for future implementation)
- **Automatic Tagging**: AI-powered tag suggestions based on note content
- **AI-Generated Titles**: Automatic title generation when users leave the title field empty

### Technical Implementation

- **Modern Stack**: Built with React, TypeScript, Vite, and Tailwind CSS
- **UI Components**: Uses Shadcn UI for consistent, accessible design
- **AI Integration**: Flexible AI service with support for OpenAI and Google Gemini models
- **Vector Embeddings**: Semantic search capabilities using OpenAI embeddings
- **Database**: Supabase for secure data storage and authentication
- **Responsive Design**: Works across various screen sizes

## Upcoming Features

Based on our design principles and user needs, the following features are planned for implementation:

### 1. Progressive Disclosure in Note Creation
Start with a minimal interface showing only the essentials (content field, save button), but progressively reveal more options as the user engages with the note.

### 2. Soft Delete with Graceful Recovery
Instead of permanent deletion, move notes to an archive with a simple recovery option, showing recently archived notes in a separate section that fades over time.

### 3. Gesture-Based Controls
Implement intuitive gestures for common actions like swipe down to save and close, swipe left/right to navigate between notes, and pinch to minimize or expand the note modal.

### 4. Focus Mode
One-tap option that dims everything except the note content, creating a distraction-free writing environment within the modal.

### 5. Rich Media Quick-Capture
Enable capturing images, voice notes, or sketches directly into notes with minimal friction using single tap/gesture to add different media types.

See [IDEAS.md](docs/IDEAS.md) for more upcoming feature details.

## Running the Project Locally

### Prerequisites

- Node.js (v16.x or later recommended)
- npm (v7.x or later)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thoughtscape-journal.git
cd thoughtscape-journal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file to include your API keys:
   - Supabase URL and key
   - OpenAI API key (optional for AI features)
   - Google Gemini API key (optional for AI features)

### Running the Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:8080](http://localhost:8080)

### Building for Production

To create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
thoughtscape-journal/
├── src/                 # Source files
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   └── utils/           # Helper utilities
├── docs/                # Documentation
│   ├── DESIGN.md        # Design principles and guidelines
│   ├── EMBEDDINGS.md    # Vector embedding documentation
│   ├── IDEAS.md         # Future feature ideas
│   ├── PROGRESS.md      # Development progress log
│   └── TECHNICAL_ARCHITECTURE.md # Technical architecture details
├── public/              # Static assets
└── .env.example         # Example environment variables
```

## Contributing

We welcome contributions to Memory Lane! Please read our [contribution guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Shadcn UI for the beautiful component library
- OpenAI and Google for AI capabilities
- Supabase for database and authentication
- All contributors and testers
