# API Testing Tool

A comprehensive React-based API testing tool with support for multiple profiles, request history, and mock responses.

## Features

- Multiple API profile management
- Request history tracking
- Response caching with TTL
- Mock API support
- Dark mode support
- Comprehensive error handling
- TypeScript support
- Full test coverage

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Tool-For-API.git
cd Tool-For-API
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running Tests

The project uses Jest and React Testing Library for testing. To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Project Structure

```
src/
├── components/      # React components
├── contexts/        # React contexts
├── services/        # Core services
├── types/          # TypeScript types
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Testing Strategy

The project follows a comprehensive testing strategy:

1. Unit Tests
   - Core services (apiClient, cacheService, etc.)
   - Utility functions
   - React hooks

2. Integration Tests
   - API Context
   - Component interactions
   - Service interactions

3. Component Tests
   - UI components
   - User interactions
   - State management

4. Mock Services
   - API responses
   - Storage operations
   - Network requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
