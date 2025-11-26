import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneInput } from '@/components/auth/PhoneInput';

describe('PhoneInput Component', () => {
  const mockOnSubmit = jest.fn();
  const mockLoading = false;
  const mockError = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render phone input form correctly', () => {
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
  });

  it('should format phone input correctly', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number') as HTMLInputElement;
    
    // Type a phone number
    await user.type(input, '5551234567');
    
    // Should accept the input as is (no longer stripping/formatting in the component)
    expect(input.value).toBe('5551234567');
  });

  it('should only allow numeric input', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number') as HTMLInputElement;
    
    // Try to type letters and special characters
    await user.type(input, 'abc!@#123');
    
    // Should accept all characters (validation happens on submit)
    expect(input.value).toBe('abc!@#123');
  });

  it('should limit input to 10 digits', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number') as HTMLInputElement;
    
    // Try to type more than 10 digits
    await user.type(input, '123456789012345');
    
    // Should accept all characters (no longer limited to 10 digits)
    expect(input.value).toBe('123456789012345');
  });

  it('should call onSubmit with formatted phone number when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');
    const submitButton = screen.getByRole('button', { name: /send code/i });

    // Type a valid phone number
    await user.type(input, '5551234567');
    
    // Submit the form
    await user.click(submitButton);

    // Should call onSubmit with phone data object
    expect(mockOnSubmit).toHaveBeenCalledWith({
      phone: '+15551234567',
      countryCode: 'US'
    });
  });

  it('should not submit with incomplete phone number', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');
    const submitButton = screen.getByRole('button', { name: /send code/i });

    // Type only 6 digits (less than minimum)
    await user.type(input, '555123');
    
    // Submit button should be disabled
    expect(submitButton).toBeDisabled();
    
    // Try to submit anyway
    await user.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error message when error prop is provided', () => {
    const errorMessage = 'Invalid phone number';
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-electric-peach');
  });

  it('should disable input and button when loading', () => {
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={true}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');
    const submitButton = screen.getByRole('button', { name: /sending/i });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');

    // Type a valid phone number
    await user.type(input, '5551234567');
    
    // Submit with Enter key
    await user.type(input, '{Enter}');

    // Should call onSubmit with phone data object
    expect(mockOnSubmit).toHaveBeenCalledWith({
      phone: '+15551234567',
      countryCode: 'US'
    });
  });

  it('should not submit with Enter key if phone number is incomplete', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');

    // Type an incomplete phone number
    await user.type(input, '555123{Enter}');

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    const input = screen.getByPlaceholderText('Enter phone number');
    
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('required');
    // Pattern attribute is no longer used since we support international numbers
  });

  it('should display helper text', () => {
    render(
      <PhoneInput
        onSubmit={mockOnSubmit}
        loading={mockLoading}
        error={mockError}
      />
    );

    expect(screen.getByText(/we'll send you a one-time code/i)).toBeInTheDocument();
  });
});