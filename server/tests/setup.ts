// Ensure env validation passes during tests before any module reads process.env.
process.env.NODE_ENV ||= 'test';
process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/eduswap_test';
process.env.JWT_ACCESS_SECRET ||= 'test_access_secret_1234567890';
process.env.JWT_REFRESH_SECRET ||= 'test_refresh_secret_1234567890';
process.env.CLIENT_URL ||= 'http://localhost:5173';
