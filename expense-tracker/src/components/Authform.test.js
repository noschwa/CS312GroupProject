//This component will display login fields, validate email and password, 
//and call login function when submit is entered
import { fireEvent, render, screen } from '@testing-library/react';
import AuthForm from './AuthForm';

describe('AuthForm Component', () => {
    const mockLogin = jest.fn();

    test('renders login fields', () => {
        render(<AuthForm onLogin={mockLogin} />);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    test('validates empty fields', () => {
        render(<AuthForm onLogin={mockLogin} />);
        fireEvent.click(screen.getByText(/Login/i));

        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    test('calls onLogin with correct data', () => {
        render(<AuthForm onLogin={mockLogin} />);
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByText(/Login/i));

        expect(mockLogin).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });
});
