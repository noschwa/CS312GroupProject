//This component will render input fields and show an error when required fields are blank.
//It will also call onSubmit with the correct data when the form is submitted.
import { fireEvent, render, screen } from '@testing-library/react';
import ExpenseForm from './ExpenseForm';

describe('ExpenseForm Component', () => {
    const mockOnSubmit = jest.fn();

    test('renders input fields correctly', () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} />);
        expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    });

    test('shows validation errors when required fields are empty', async () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} />);
        fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

        expect(await screen.findByText(/Please select a category/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid amount/i)).toBeInTheDocument();
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });

    test('calls onSubmit with correct data', () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} />);
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '25.50' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Lunch' } });
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-11-25' } });

        fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
        expect(mockOnSubmit).toHaveBeenCalledWith({
            categoryId: 'Food',
            amount: 25.5,
            description: 'Lunch',
            expenseDate: '2024-11-25',
        });
    });
});
