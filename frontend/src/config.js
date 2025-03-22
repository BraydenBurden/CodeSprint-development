const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = "8080"; // Your backend port
  return `http://${hostname}:${port}`;
};

const config = {
  API_URL: process.env.REACT_APP_API_URL || getBaseUrl(),
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || getBaseUrl(),
};

export default config;
