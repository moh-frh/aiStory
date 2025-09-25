# AI Story Generator

An AI-powered story generator for kids that creates personalized stories where children become the heroes of their own adventures.

## Features

- **Personalized Stories**: Parents can enter their child's name and upload a photo to create custom stories
- **Reading Length Options**: Choose from short (5 minutes), medium (10 minutes), or long (15+ minutes) stories
- **Multiple Story Types**: 
  - 🦸 Superhero adventures
  - 🗺️ Epic quests and discoveries
  - 🧙 Magic and mystical creatures
  - 🏰 Classic fairy tales with a twist
  - 🚀 Space adventures through the stars
- **Interactive Reading Experience**: Beautiful story display with illustrations and page navigation
- **Child Photo Integration**: Stories incorporate the child's photo for a fully personalized experience

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. For iOS, install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

### Development

- Start the Metro bundler:
  ```bash
  npm start
  ```

- Run tests:
  ```bash
  npm test
  ```

- Run linting:
  ```bash
  npm run lint
  ```

## Project Structure

- `App.tsx` - Main application component with navigation setup
- `screens/` - Application screens
  - `HomeScreen.tsx` - Child name input and photo upload
  - `StorySettingsScreen.tsx` - Story customization options
  - `StoryDisplayScreen.tsx` - Interactive story reading experience
- `types/StoryTypes.ts` - TypeScript type definitions
- `android/` - Android-specific code and configuration
- `ios/` - iOS-specific code and configuration
- `__tests__/` - Test files

## How It Works

1. **Setup**: Parents enter their child's name and optionally upload a photo
2. **Customization**: Choose reading length and story type preferences
3. **Generation**: The AI creates a personalized story where the child is the main character
4. **Reading**: Enjoy an interactive story experience with illustrations and smooth navigation

## Dependencies

- React Navigation for screen navigation
- React Native Image Picker for photo uploads
- React Native Vector Icons for UI elements
- React Native Linear Gradient for enhanced visuals
- React Native Gesture Handler for smooth interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.