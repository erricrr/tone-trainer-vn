[![Netlify Status](https://api.netlify.com/api/v1/badges/9b5ace46-3c2d-427a-95a8-ecd66a48dbf0/deploy-status)](https://app.netlify.com/projects/vn-tt/deploys)

# VN Tone Trainer

A Vietnamese tone training application designed to help learners master the challenging tonal aspects of the Vietnamese language through interactive practice and AI-powered quizzes.

## Features

- **Practice Mode**: Learn Vietnamese words with their tone variations and meanings
- **Quiz Mode**: AI-generated quizzes that adapt to your difficulty level
- **Audio Pronunciation**: Text-to-speech for pronunciation practice
- **AI Feedback**: Feedback from Gemini-2.0-Flash
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with TypeScript and Turbopack
- **UI Components**: Radix UI with Tailwind CSS
- **AI Integration**: Google AI via Genkit (Gemini-2.0-Flash)
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Audio**: Google Translate TTS API

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- A **Google AI API key** (required for quiz generation)
  - Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tone-trainer-vn
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI quiz generation and evaluation
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
```

**Getting your Google AI API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 3. Run the Development Server

```bash
# Start the Next.js development server
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002)

### 4. Optional: AI Development Tools

For AI feature development and debugging:

```bash
# Start Genkit development server (in a separate terminal)
npm run genkit:dev
```

This starts the Genkit developer UI at [http://localhost:4000](http://localhost:4000)

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run genkit:dev` - Start Genkit AI development tools
- `npm run genkit:watch` - Start Genkit with file watching
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── ai/                    # AI integration and flows
│   ├── genkit.ts         # Genkit configuration
│   ├── dev.ts            # Development setup
│   └── flows/            # AI flow definitions
│       └── quiz-evaluation.ts
├── app/                  # Next.js app router
│   ├── api/              # API routes
│   │   └── tts/          # Text-to-speech proxy
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   ├── practice-view.tsx # Practice mode interface
│   ├── quiz-view.tsx     # Quiz mode interface
│   ├── speak-button.tsx  # Audio playback component
│   └── voice-recorder.tsx # Voice recording component
├── data/                 # Static data
│   └── words.ts          # Vietnamese word database
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── types/                # TypeScript type definitions
```

## Vietnamese Tone System

The app covers all six Vietnamese tones:
- **Level** (ngang): no mark - `ma` (ghost)
- **Falling** (huyền): grave accent ` - `mà` (but/that)
- **Rising** (sắc): acute accent ´ - `má` (mother/cheek)
- **Falling-rising** (hỏi): hook above ̉ - `mả` (grave)
- **Creaky** (ngã): tilde ~ - `mã` (code/horse)
- **Heavy** (nặng): dot below . - `mạ` (rice seedling)

## Troubleshooting

### Common Issues

#### 1. "GOOGLE_GENAI_API_KEY is not defined"

**Solution**: Ensure your `.env` file is in the root directory with the correct API key:
```env
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

#### 2. Quiz evaluation fails

**Possible causes**:
- Invalid or expired Google AI API key
- Network connectivity issues
- API rate limits exceeded

**Solutions**:
- Verify your API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check your internet connection
- Wait a moment and try again if rate limited

#### 3. Audio not working

**Possible causes**:
- Browser autoplay policies
- Network issues with Google Translate TTS
- Missing audio permissions

**Solutions**:
- Click somewhere on the page first (browser requirement)
- Check browser console for errors
- Ensure your browser allows audio autoplay

#### 4. Port conflicts

If port 9002 is in use:
```bash
# Kill process using the port
lsof -ti:9002 | xargs kill -9

# Or run on a different port
npm run dev -- --port 3000
```


## Contact

Questions or feedback? Email [voicevoz321@gmail.com](mailto:voicevoz321@gmail.com)

---

**Happy learning! Chúc bạn học tốt! 🇻🇳**
