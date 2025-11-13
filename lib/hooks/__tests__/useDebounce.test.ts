import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    act(() => {
      rerender({ value: 'updated', delay: 100 });
    });

    // Value should still be initial (debounce not complete)
    expect(result.current).toBe('initial');

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should handle rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      {
        initialProps: { value: 'first' },
      }
    );

    // Rapid changes
    act(() => {
      rerender({ value: 'second' });
    });
    act(() => {
      rerender({ value: 'third' });
    });
    act(() => {
      rerender({ value: 'final' });
    });

    // Value should still be first
    expect(result.current).toBe('first');

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be the last value
    expect(result.current).toBe('final');
  });

  it('should use default delay of 300ms when not specified', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    act(() => {
      rerender({ value: 'updated' });
    });

    // Wait less than default delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(result.current).toBe('initial');

    // Wait remaining time
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(result.current).toBe('updated');
  });

  it('should handle non-string values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      {
        initialProps: { value: 42 },
      }
    );

    expect(result.current).toBe(42);

    act(() => {
      rerender({ value: 100 });
    });

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(result.current).toBe(100);
  });

  it('should handle object values', async () => {
    const initialObj = { count: 0 };
    const updatedObj = { count: 5 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      {
        initialProps: { value: initialObj },
      }
    );

    expect(result.current).toBe(initialObj);

    act(() => {
      rerender({ value: updatedObj });
    });

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(result.current).toBe(updatedObj);
  });
});
