import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/welcome to name/i);
  expect(welcomeMessage).toBeInTheDocument();
});

test('renders log in button', () => {
  render(<App />);
  const loginButton = screen.getByText(/log in/i);
  expect(loginButton).toBeInTheDocument();
});
