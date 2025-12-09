# Online Survey System

A complete DevOps-enabled survey management application built with Node.js, Express, and Docker.

## Features

- Create and manage surveys
- RESTful API endpoints
- Health check monitoring
- Docker containerization
- Automated CI/CD pipeline
- Jest unit tests

## Quick Start

### Prerequisites
- Node.js 16+
- Docker (optional)
- npm or yarn

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/aimeniyoyabikoze-arch/CAT-ONLINE-SURVEY-SYSTEM.git
cd OnlineSurveySystem
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Access the app at `http://localhost:3000`

### Development

Run with auto-reload:
```bash
npm run dev
```

### Testing

Run all tests with coverage:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

### Docker Setup

Build and run with Docker:
```bash
docker build -t survey-system .
docker run -p 3000:3000 survey-system
```

Or use Docker Compose:
```bash
docker-compose up
```

## API Endpoints

- `GET /` - Frontend
- `GET /health` - Health check
- `GET /api/surveys` - List all surveys
- `POST /api/surveys` - Create new survey

## Project Structure

```
├── public/              # Frontend files
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .github/workflows/   # CI/CD pipelines
├── index.js            # Main server file
├── package.json        # Dependencies
├── Dockerfile          # Container config
└── docker-compose.yml  # Multi-container setup
```

## License

MIT
# Force workflow update on Tue Dec  9 09:20:17 PM CAT 2025

# CI/CD Pipeline Status: All 10 jobs configured successfully
