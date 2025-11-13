import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from '../TagFilter';

describe('TagFilter Component', () => {
  describe('Basic Rendering', () => {
    it('should render nothing when tags array is empty', () => {
      const onTagSelect = vi.fn();
      const { container } = render(
        <TagFilter tags={[]} selectedTag={null} onTagSelect={onTagSelect} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render tag label', () => {
      const onTagSelect = vi.fn();
      render(
        <TagFilter
          tags={['tag1']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('태그:')).toBeInTheDocument();
    });

    it('should render all provided tags', () => {
      const onTagSelect = vi.fn();
      const tags = ['javascript', 'react', 'typescript'];

      render(
        <TagFilter
          tags={tags}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should render tags as buttons', () => {
      const onTagSelect = vi.fn();
      render(
        <TagFilter
          tags={['tag1', 'tag2']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Should have 2 tag buttons (no reset button when no selection)
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Tag Selection', () => {
    it('should call onTagSelect when tag is clicked', async () => {
      const user = userEvent.setup();
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      const javascriptButton = screen.getByText('javascript');
      await user.click(javascriptButton);

      expect(onTagSelect).toHaveBeenCalledWith('javascript');
    });

    it('should highlight selected tag', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const javascriptButton = screen.getByText('javascript');
      const reactButton = screen.getByText('react');

      // Selected tag should have primary background
      expect(javascriptButton).toHaveClass('bg-primary');
      // Non-selected tag should have transparent background
      expect(reactButton).toHaveClass('bg-primary/10');
    });

    it('should toggle tag selection when clicking selected tag', async () => {
      const user = userEvent.setup();
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const button = screen.getByText('javascript');
      await user.click(button);

      expect(onTagSelect).toHaveBeenCalledWith(null);
    });

    it('should switch selection when clicking different tag', async () => {
      const user = userEvent.setup();
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const reactButton = screen.getByText('react');
      await user.click(reactButton);

      expect(onTagSelect).toHaveBeenCalledWith('react');
    });
  });

  describe('Reset Button', () => {
    it('should show reset button when tag is selected', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
    });

    it('should not show reset button when no tag is selected', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.queryByText('필터 초기화')).not.toBeInTheDocument();
    });

    it('should call onTagSelect with null when reset is clicked', async () => {
      const user = userEvent.setup();
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const resetButton = screen.getByText('필터 초기화');
      await user.click(resetButton);

      expect(onTagSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Accessibility', () => {
    it('should have proper group role', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByRole('group', { name: '태그 필터' })).toBeInTheDocument();
    });

    it('should have aria-pressed attribute on tag buttons', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const javascriptButton = screen.getByText('javascript');
      const reactButton = screen.getByText('react');

      expect(javascriptButton).toHaveAttribute('aria-pressed', 'true');
      expect(reactButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have descriptive aria-labels on tag buttons', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      const javascriptButton = screen.getByLabelText('javascript 태그로 필터링');
      expect(javascriptButton).toBeInTheDocument();
    });

    it('should have aria-label on reset button', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      const resetButton = screen.getByLabelText('태그 필터 초기화');
      expect(resetButton).toBeInTheDocument();
    });

    it('should have focus ring styles', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['javascript']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      const button = screen.getByText('javascript');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-primary');
    });
  });

  describe('Multiple Tags', () => {
    it('should handle many tags', () => {
      const onTagSelect = vi.fn();
      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i + 1}`);

      render(
        <TagFilter
          tags={manyTags}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getAllByRole('button')).toHaveLength(20);
    });

    it('should handle tags with special characters', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['C++', 'C#', 'Node.js']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('C++')).toBeInTheDocument();
      expect(screen.getByText('C#')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('should handle Korean tag names', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['자바스크립트', '리액트', '타입스크립트']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
      expect(screen.getByText('리액트')).toBeInTheDocument();
      expect(screen.getByText('타입스크립트')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single tag', () => {
      const onTagSelect = vi.fn();

      render(
        <TagFilter
          tags={['only-tag']}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('only-tag')).toBeInTheDocument();
    });

    it('should handle very long tag names', () => {
      const onTagSelect = vi.fn();
      const longTag = 'very-long-tag-name-that-should-still-work';

      render(
        <TagFilter
          tags={[longTag]}
          selectedTag={null}
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText(longTag)).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const onTagSelect = vi.fn();
      const { rerender } = render(
        <TagFilter
          tags={['javascript', 'react']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('필터 초기화')).toBeInTheDocument();

      rerender(
        <TagFilter
          tags={['javascript', 'react', 'typescript']}
          selectedTag="javascript"
          onTagSelect={onTagSelect}
        />
      );

      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
  });
});
