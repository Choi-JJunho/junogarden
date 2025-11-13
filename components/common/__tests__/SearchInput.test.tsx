import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with default placeholder', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      expect(screen.getByPlaceholderText('검색어를 입력하세요...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const onChange = vi.fn();
      render(
        <SearchInput
          value=""
          onChange={onChange}
          placeholder="Custom placeholder"
        />
      );

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('should display current value', () => {
      const onChange = vi.fn();
      render(<SearchInput value="test query" onChange={onChange} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });
  });

  describe('User Interaction', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // Should be called for each character typed
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should call onChange with input value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'hello');

      // onChange should be called with string values
      expect(onChange).toHaveBeenCalled();
      onChange.mock.calls.forEach((call) => {
        expect(typeof call[0]).toBe('string');
      });
    });

    it('should handle clearing the input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="test" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.clear(input);

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should handle Korean characters', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '테스트');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper id for label association', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('id', 'search-input');
    });

    it('should have screen reader label', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      expect(screen.getByLabelText('검색')).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-label', '블로그 게시물 검색');
    });

    it('should have searchbox role', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should have type="search"', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      let value = '';
      const onChange = vi.fn((newValue) => {
        value = newValue;
      });

      const { rerender } = render(<SearchInput value={value} onChange={onChange} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('');

      await user.type(input, 'test');

      rerender(<SearchInput value={value} onChange={onChange} />);
      expect(input.value).toBe(value);
    });

    it('should update when value prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(<SearchInput value="initial" onChange={onChange} />);

      let input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<SearchInput value="updated" onChange={onChange} />);

      input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('updated');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '!@#$%^&*()');

      expect(onChange).toHaveBeenCalled();
    });

    it('should handle long strings', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SearchInput value="" onChange={onChange} />);

      const longString = 'a'.repeat(1000);
      const input = screen.getByRole('searchbox');
      await user.type(input, longString);

      expect(onChange).toHaveBeenCalledTimes(1000);
    });
  });
});
