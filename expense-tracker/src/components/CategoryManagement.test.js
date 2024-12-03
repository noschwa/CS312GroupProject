//This will fetch, display, add, edit, and delete categories
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import CategoryManagement from './CategoryManagement';

jest.mock('axios');

describe('CategoryManagement Component', () => {
    const mockCategories = [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
    ];

    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockCategories });
    });

    test('fetches and displays categories', async () => {
        render(<CategoryManagement />);
        expect(screen.getByText(/Loading categories.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Food')).toBeInTheDocument();
            expect(screen.getByText('Transport')).toBeInTheDocument();
        });
    });

    test('allows adding a category', async () => {
        axios.post.mockResolvedValue({ data: { id: 3, name: 'Utilities' } });

        render(<CategoryManagement />);
        fireEvent.change(screen.getByPlaceholderText(/New Category Name/i), { target: { value: 'Utilities' } });
        fireEvent.click(screen.getByText(/Add Category/i));

        await waitFor(() => expect(screen.getByText('Utilities')).toBeInTheDocument());
    });

    test('allows editing a category', async () => {
        axios.put.mockResolvedValue({ data: { id: 1, name: 'Groceries' } });

        render(<CategoryManagement />);
        await waitFor(() => screen.getByText('Food'));

        fireEvent.click(screen.getByText(/Edit/i, { selector: 'button' }));
        fireEvent.change(screen.getByDisplayValue(/Food/i), { target: { value: 'Groceries' } });
        fireEvent.blur(screen.getByDisplayValue(/Groceries/i));

        await waitFor(() => expect(screen.getByText('Groceries')).toBeInTheDocument());
    });

    test('allows deleting a category', async () => {
        axios.delete.mockResolvedValue({});

        render(<CategoryManagement />);
        await waitFor(() => screen.getByText('Food'));

        fireEvent.click(screen.getByText(/Delete/i, { selector: 'button' }));
        await waitFor(() => expect(screen.queryByText('Food')).not.toBeInTheDocument());
    });
});
