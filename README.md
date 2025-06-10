# MCQ Helper Chrome Extension

A Chrome extension designed to assist with multiple choice questions using Google's Generative AI (Gemini). The extension provides intelligent answers for selected multiple choice questions through a discrete popup interface.

## Features

- Context menu integration for easy access
- Popup display with AI-generated answers
- Text selection support
- Error handling and user feedback
- Clean, minimalist interface

## Tech Stack

- **Frontend:**
  - HTML/CSS for popup interface
  - Vanilla JavaScript for DOM manipulation
  - Chrome Extension APIs

- **Backend Integration:**
  - Google Generative AI (Gemini) API
  - RESTful API calls using Fetch API

## Project Structure

```
mcq-helper-extension/
├── manifest.json        # Extension configuration
├── content.js          # Content script for webpage interaction
├── background.js       # Background script for extension logic
├── popup.html         # Popup interface
├── styles.css         # Styling for popup
└── icons/             # Extension icons
```

## Setup

1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Configure your Gemini API key in the extension settings

## Usage

1. Select text containing a multiple choice question
2. Right-click and select the MCQ Helper option
3. View the AI-generated answer in the popup

## Current Status

The extension is currently in development with the following components completed:
- Basic extension structure
- UI components (popup, context menu)
- Error handling and logging system

Work in progress:
- API integration with Gemini
- Answer processing optimization
- Enhanced error handling

## Author

[Rob Hand](https://github.com/RobHand27/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 