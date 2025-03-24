// ...existing code...
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');
  
  try {
    await login(credentials);
    navigate('/dashboard');
  } catch (error) {
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
};
// ...existing code...
