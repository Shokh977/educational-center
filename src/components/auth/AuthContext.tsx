// ...existing code...
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }

    setUser(data);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
// ...existing code...
