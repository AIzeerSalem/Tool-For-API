# API Tool

A modern React-based API interaction tool that allows you to test, monitor, and manage API requests with a beautiful and intuitive interface.

## Features

- 🚀 Modern React + TypeScript implementation
- 🎨 Material-UI with dark mode support
- 📝 API profile management
- 📊 Real-time request visualization
- 🔄 Request history with replay functionality
- 🧪 Mock API support for offline testing
- 💾 Local data persistence
- 📤 Data import/export functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AIzeerSalem/Tool-For-API.git
cd api-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

### API Profiles

- Create and manage multiple API profiles
- Configure authentication (Bearer Token, Basic Auth)
- Set custom headers and API keys
- Enable/disable mock API responses

### Making Requests

1. Select an API profile from the header dropdown
2. Choose the request method (GET, POST, PUT, DELETE, PATCH)
3. Enter the endpoint path
4. Add request body for POST/PUT/PATCH requests
5. Click "Send Request" to execute

### Request History

- View all previous requests with timestamps
- See request details including parameters and responses
- Replay previous requests with a single click
- Clear history as needed

### Data Visualization

- Monitor response times with real-time charts
- Analyze status code distribution
- Track API usage patterns

### Settings

- Toggle dark/light theme
- Enable/disable mock API
- Import/export application data
