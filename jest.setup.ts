import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.GITHUB_CLIENT_ID = 'test_client_id';
process.env.GITHUB_CLIENT_SECRET = 'test_client_secret';
process.env.TOGETHER_API_KEY = 'test_together_key';
process.env.KESTRA_API_URL = 'http://localhost:8080/api/v1';

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
});
