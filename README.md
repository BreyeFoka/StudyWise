# StudyWise - Your Academic Assistant

A revolutionary academic assistant for college students, powered by AI.

## Features

- **AI-powered Chat**: Get answers to your academic questions with contextual chat
- **Note Summarization**: Upload documents and get AI-generated summaries
- **Flashcard Generator**: Generate flashcards from your study materials
- **Homework Helper**: Step-by-step explanations for complex problems
- **Quiz Generator**: Create quizzes to test your knowledge
- **Deadline Management**: Keep track of important deadlines
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI**: Google AI (Gemini) via Genkit
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Google AI API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/BreyeFoka/StudyWise.git
cd StudyWise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI Configuration (for Genkit)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
```

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your configuration keys from Project Settings

### 5. Google AI Setup

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the key to your environment variables

### 6. Development

```bash
# Start the development server
npm run dev

# Start Genkit development server (in a separate terminal)
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) to view the app.
Open [http://localhost:4000](http://localhost:4000) to view Genkit developer UI.

### 7. Building for Production

```bash
# Type check
npm run typecheck

# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```text
src/
├── ai/                 # AI flows and configurations
│   ├── flows/         # Genkit AI flows
│   ├── schemas/       # Zod schemas for AI inputs/outputs
│   ├── genkit.ts      # Genkit configuration
│   └── dev.ts         # Development entry point
├── app/               # Next.js app router pages
│   ├── (auth)/        # Authentication pages
│   ├── (app)/         # Protected app pages
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── layout/       # Layout components
├── contexts/          # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
│   ├── firebase/     # Firebase configuration
│   └── utils.ts      # General utilities
└── services/         # API services
```

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit in watch mode

## Known Issues & Fixes Applied

### Fixed Issues

1. ✅ **TypeScript Errors**: Fixed missing Auth type import in auth-context
2. ✅ **Genkit API Usage**: Updated contextual chat flow to use correct API structure
3. ✅ **Sidebar Navigation**: Fixed Button component usage with asChild prop
4. ✅ **Missing Types**: Added @types/react-syntax-highlighter for markdown rendering
5. ✅ **Package Name**: Updated package.json name from "nextn" to "studywise"
6. ✅ **Suspense Boundaries**: Added Suspense wrappers for auth pages using useSearchParams
7. ✅ **Next.js Types**: Added next-env.d.ts for proper Next.js type support

### Remaining Security Vulnerabilities

- Some moderate vulnerabilities in dependencies (Next.js, PrismJS) - can be fixed with `npm audit fix --force` but may cause breaking changes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.
