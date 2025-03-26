# Reword This - Chrome Extension

A Chrome extension that helps users improve their writing with AI-powered text rewriting capabilities.

## Features

- **Simple Text Rewriting**: Quickly rewrite selected text with different tone options (Clarity, Friendly, Formal, or Surprise Me)
- **Battle of Rewrites**: Compare two AI-generated rewrites side-by-side and choose the best one
- **Custom Tone Builder**: Create rewrites by providing a reference sample text in your desired tone or style
- **Gamification**: Earn XP and build streaks as you use the extension to improve your writing
- **Context Menu Integration**: Right-click on any selected text on the web to open the extension

## Installation

### Development Mode

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Production Build

1. Build the extension:
   ```
   npm run build
   ```
2. The built extension will be in the `dist` folder
3. Load it in Chrome as described above

## Usage

1. Select text on any webpage
2. Right-click and select "Reword This" from the context menu
3. Use the popup to select your desired tone
4. Click "Reword This!" to generate a rewritten version
5. Use "Battle of Rewrites" to compare two different rewrites
6. Use "Custom Tone" to create a rewrite based on a reference sample

## Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- CRXJS

## Project Structure

- `src/`: Source code
  - `components/`: UI components
  - `hooks/`: Custom React hooks
  - `pages/`: Top-level page components
  - `background.ts`: Chrome extension background script
  - `content.ts`: Chrome extension content script
  - `manifest.json`: Chrome extension manifest

## Development

This project uses Vite for fast development and building. Key commands:

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## License

MIT 