# AI Short Video Creator

An intelligent web application for creating short videos with AI-powered content generation, image processing, and advanced video editing capabilities.

## 🎯 Features

### Core Functionality
- **AI-Powered Content Generation**: Generate video scripts and scenes using AI
- **Multiple Creation Workflows**: 
  - V1: Basic video creation
  - V2: Advanced timeline-based editor with overlay support
- **Image Processing**: Apply filters, effects, and transformations to images
- **Video Export**: Generate MP4 videos using FFmpeg in the browser
- **Timeline Editor**: Professional timeline interface for precise video editing

### Advanced Features
- **Image Overlays**: Add and position images on video scenes
- **Text Overlays**: Add customizable text with various fonts and styles
- **Stickers & Effects**: Rich library of stickers and visual effects
- **Scene Transitions**: Smooth transitions between video scenes
- **Real-time Preview**: WYSIWYG editor with live preview
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser with SharedArrayBuffer support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AI-short-video-creator.git
   cd AI-short-video-creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ImageFilters/    # Image filter components
│   ├── SceneEditor/     # Scene editing components
│   └── VideoExport/     # Video export functionality
├── pages/               # Main application pages
│   ├── CreateVideo/     # Video creation workflows
│   │   ├── V1/         # Basic creation workflow
│   │   └── V2/         # Advanced timeline editor
│   ├── ImageGenerate/   # Image generation features
│   └── VideoList/       # Video management
├── utils/               # Utility functions
│   ├── ffmpeg/         # FFmpeg processing
│   └── imageProcessing/ # Image manipulation
└── styles/              # CSS and styling
```

## 🎬 How to Use

### Creating Your First Video

1. **Choose Creation Method**
   - Select "Create Video V1" for simple video creation
   - Select "Create Video V2" for advanced timeline editing

2. **Generate Content**
   - Enter your video topic or theme
   - Let AI generate scenes and script
   - Review and edit the generated content

3. **Customize Scenes**
   - Apply filters to images
   - Add text overlays and stickers
   - Adjust timing and transitions
   - Position elements using drag-and-drop

4. **Export Video**
   - Configure video settings (resolution, framerate)
   - Generate and download your MP4 video

### Timeline Editor (V2)

The advanced timeline editor provides:
- **Scene Management**: Add, remove, and reorder scenes
- **Element Layering**: Multiple overlay layers with z-index control
- **Timing Control**: Precise start/end times for all elements
- **Live Preview**: Real-time preview of your video
- **Professional Tools**: Industry-standard timeline interface

## 🛠️ Available Scripts

### Development
```bash
npm start          # Run development server
npm test           # Run test suite
npm run build      # Build for production
npm run eject      # Eject from Create React App (one-way operation)
```

### Additional Scripts
```bash
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run analyze    # Analyze bundle size
```

## 🔧 Configuration

### Video Settings
- **Resolution**: 1080p, 720p, 480p
- **Frame Rate**: 24fps, 30fps, 60fps
- **Format**: MP4 (H.264)
- **Audio**: AAC encoding

### Browser Requirements
- Chrome 91+ (recommended)
- Firefox 90+
- Safari 14+
- Edge 91+

**Note**: SharedArrayBuffer support required for FFmpeg functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- Use ESLint and Prettier for consistent formatting
- Follow React best practices and hooks patterns
- Write descriptive commit messages
- Add comments for complex functionality

### Testing
- Write unit tests for utility functions
- Add integration tests for major features
- Test across different browsers and devices

## 🐛 Troubleshooting

### Common Issues

**FFmpeg not loading**
- Ensure your browser supports SharedArrayBuffer
- Check if running on HTTPS (required for some browsers)
- Clear browser cache and reload

**Video export fails**
- Check browser console for errors
- Verify all media files are loaded
- Ensure sufficient browser memory

**Performance issues**
- Reduce video resolution for better performance
- Close unnecessary browser tabs
- Use Chrome for best performance

## 📚 Technologies Used

- **Frontend**: React 18, HTML5 Canvas, CSS3
- **Video Processing**: FFmpeg.wasm
- **Image Processing**: Custom JavaScript utilities
- **State Management**: React Hooks, Context API
- **UI Components**: Custom components with modern CSS
- **Build Tool**: Create React App, Webpack

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React components and UI/UX
- **Video Processing**: FFmpeg integration and optimization
- **AI Integration**: Content generation and processing
- **Design**: User interface and experience design

## 🔮 Roadmap

- [ ] Advanced AI voice generation
- [ ] Real-time collaboration features
- [ ] Cloud storage integration
- [ ] Mobile app development
- [ ] Advanced animation tools
- [ ] Social media integration


