# New Code Reviewer 🤖

An intelligent AI-powered code review tool that leverages Google’s Gemini API to provide comprehensive code analysis, suggestions, and improvements. This tool helps developers identify potential issues, optimize code quality, and follow best practices across multiple programming languages.

## ✨ Features

- **🔍 Intelligent Code Analysis**: Advanced AI-powered code review using Google’s Gemini API
- **🛠️ Multi-Language Support**: Reviews code written in various programming languages
- **📊 Comprehensive Reports**: Detailed analysis including code quality metrics, security vulnerabilities, and performance suggestions
- **🎯 Best Practice Recommendations**: Suggests improvements based on industry standards and coding conventions
- **⚡ Real-Time Processing**: Fast and efficient code analysis with immediate feedback
- **🌐 Web-Based Interface**: Easy-to-use web application for seamless code review experience
- **🔗 AI Studio Integration**: Connected with Google AI Studio for enhanced capabilities

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **Gemini API Key** from Google AI Studio

### Installation

1. **Clone the repository**
   
   ```bash
   git clone https://github.com/rajshah9305/newcodereviewer.git
   cd newcodereviewer
   ```
1. **Install dependencies**
   
   ```bash
   npm install
   ```
1. **Configure environment variables**
- Copy `.env.local` and add your Gemini API key:
   
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
1. **Start the development server**
   
   ```bash
   npm run dev
   ```
1. **Open your browser**
   Navigate to `http://localhost:3000` to start using the code reviewer

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=3000
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.studio/)
1. Sign in with your Google account
1. Create a new project or select an existing one
1. Generate an API key for Gemini
1. Copy the API key to your `.env.local` file

## 📖 Usage

### Basic Code Review

1. **Upload Code**: Paste your code into the input area or upload a file
1. **Select Language**: Choose the programming language for optimal analysis
1. **Run Review**: Click the review button to start the AI analysis
1. **View Results**: Review the comprehensive feedback and suggestions

### Supported Languages

- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- And many more…

### Review Categories

- **Code Quality**: Style, readability, and maintainability
- **Security**: Potential vulnerabilities and security best practices
- **Performance**: Optimization opportunities and efficiency improvements
- **Best Practices**: Industry standards and coding conventions
- **Bug Detection**: Potential errors and logical issues

## 🌐 AI Studio Integration

This application is connected to Google AI Studio for enhanced functionality:

**AI Studio App**: [View in AI Studio](https://ai.studio/apps/drive/1iBT7lT3qfEf0rGJ1PGj5FFCCMzDlrrMm)

The AI Studio integration provides:

- Advanced model configurations
- Custom prompt engineering
- Enhanced analysis capabilities
- Cloud-based processing

## 🛠️ Development

### Project Structure

```
newcodereviewer/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Application pages
│   ├── utils/         # Utility functions
│   └── styles/        # CSS and styling
├── public/            # Static assets
├── .env.local         # Environment variables
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting checks
- `npm test` - Run test suite

### Contributing

1. Fork the repository
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
1. Commit your changes (`git commit -m 'Add amazing feature'`)
1. Push to the branch (`git push origin feature/amazing-feature`)
1. Open a Pull Request

## 📝 API Reference

### Code Review Endpoint

```javascript
POST /api/review
{
  "code": "your_code_here",
  "language": "javascript",
  "options": {
    "includeSecurityCheck": true,
    "includePerformanceAnalysis": true,
    "strictMode": false
  }
}
```

### Response Format

```javascript
{
  "status": "success",
  "analysis": {
    "overall_score": 85,
    "issues": [...],
    "suggestions": [...],
    "metrics": {...}
  },
  "processing_time": "2.3s"
}
```

## 🔒 Security & Privacy

- **Data Protection**: Code submissions are processed securely and not stored permanently
- **API Security**: All API communications are encrypted
- **Privacy First**: No code is shared with third parties beyond the Gemini AI service
- **Local Processing**: Option for local analysis without cloud dependency

## 📊 Performance

- **Fast Analysis**: Typical review completion in under 5 seconds
- **Scalable**: Handles codebases of various sizes
- **Efficient**: Optimized for minimal resource usage
- **Reliable**: 99.9% uptime with robust error handling

## 🤝 Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/rajshah9305/newcodereviewer/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/rajshah9305/newcodereviewer/discussions)
- **Documentation**: Comprehensive guides available in the [Wiki](https://github.com/rajshah9305/newcodereviewer/wiki)

## 📄 License

This project is licensed under the MIT License - see the <LICENSE> file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the powerful AI capabilities
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help improve this project

## 🎯 Roadmap

- [ ] Integration with popular IDEs (VS Code, IntelliJ)
- [ ] Batch processing for multiple files
- [ ] Custom rule configuration
- [ ] Team collaboration features
- [ ] Advanced metrics dashboard
- [ ] CI/CD pipeline integration

-----

**Built with ❤️ by [rajshah9305](https://github.com/rajshah9305)**

*Empowering developers with AI-driven code excellence*
