import { render, screen } from '@testing-library/react';
import Hello from './Hello';

test('renders hello message', () => {
  render(<Hello name="Dhana" />);
  expect(screen.getByText('Hello, Dhana!')).toBeInTheDocument();
});
