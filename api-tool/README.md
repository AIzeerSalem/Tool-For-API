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
git clone https://github.com/yourusername/api-tool.git
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

## Technology Stack

- React 18
- TypeScript
- Material-UI v5
- React Router v6
- Chart.js
- LocalForage
- React ChartJS 2

## Project Structure

```
api-tool/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── pages/
│   │       ├── Dashboard.tsx
│   │       ├── ApiProfiles.tsx
│   │       ├── RequestHistory.tsx
│   │       └── Settings.tsx
│   ├── contexts/
│   │   ├── ApiContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   ├── storage.ts
│   │   └── mockApi.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the beautiful component library
- Chart.js for data visualization
- LocalForage for persistent storage
- React community for the amazing ecosystem
