import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('should render title', () => {
      render(<Card title="Test Title" href="/test" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <Card
          title="Test Title"
          description="Test description"
          href="/test"
        />
      );

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render date when provided', () => {
      render(
        <Card
          title="Test Title"
          date="2025-01-15"
          href="/test"
        />
      );

      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(
        <Card
          title="Test Title"
          icon="🎨"
          href="/test"
        />
      );

      expect(screen.getByText('🎨')).toBeInTheDocument();
    });
  });

  describe('Tags Rendering', () => {
    it('should render tags when provided', () => {
      render(
        <Card
          title="Test Title"
          href="/test"
          tags={['tag1', 'tag2', 'tag3']}
        />
      );

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('should not render tags section when tags array is empty', () => {
      render(<Card title="Test Title" href="/test" tags={[]} />);

      expect(screen.queryByRole('list', { name: /태그 목록/ })).not.toBeInTheDocument();
    });

    it('should render tags with proper role attributes', () => {
      render(
        <Card
          title="Test Title"
          href="/test"
          tags={['tag1']}
        />
      );

      const tagsList = screen.getByRole('list', { name: /태그 목록/ });
      expect(tagsList).toBeInTheDocument();

      const tagItem = screen.getByRole('listitem');
      expect(tagItem).toBeInTheDocument();
    });
  });

  describe('Type Variants', () => {
    it('should render blog type correctly', () => {
      render(
        <Card
          title="Blog Post"
          href="/blog/test"
          type="blog"
          date="2025-01-15"
        />
      );

      // Blog type should show day in date
      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText('읽기')).toBeInTheDocument();
    });

    it('should render project type correctly', () => {
      render(
        <Card
          title="Project"
          href="/projects/test"
          type="project"
          date="2025-01-15"
        />
      );

      expect(screen.getByText('자세히 보기')).toBeInTheDocument();
      // Project type shows rocket emoji when no icon provided
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('should render navigation type correctly', () => {
      render(
        <Card
          title="Navigation"
          href="/page"
          type="navigation"
        />
      );

      expect(screen.getByText('바로가기')).toBeInTheDocument();
    });

    it('should not show rocket emoji for project when icon is provided', () => {
      render(
        <Card
          title="Project"
          href="/projects/test"
          type="project"
          icon="🎨"
        />
      );

      expect(screen.getByText('🎨')).toBeInTheDocument();
      expect(screen.queryByText('🚀')).not.toBeInTheDocument();
    });
  });

  describe('Link Behavior', () => {
    it('should render as a link with correct href', () => {
      render(<Card title="Test Title" href="/test-path" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test-path');
    });

    it('should have proper aria-label for blog', () => {
      render(<Card title="Test Title" href="/test" type="blog" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Test Title 보기');
    });

    it('should have proper aria-label for navigation', () => {
      render(<Card title="Test Title" href="/test" type="navigation" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Test Title 페이지로 이동');
    });
  });

  describe('Date Formatting', () => {
    it('should format blog date with day', () => {
      render(
        <Card
          title="Blog Post"
          href="/test"
          type="blog"
          date="2025-01-15"
        />
      );

      const dateElement = screen.getByRole('time');
      expect(dateElement).toHaveAttribute('dateTime', '2025-01-15');
      // Korean date format includes day for blog
      expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should format project date without day', () => {
      render(
        <Card
          title="Project"
          href="/test"
          type="project"
          date="2025-01-15"
        />
      );

      const dateElement = screen.getByRole('time');
      expect(dateElement).toHaveAttribute('dateTime', '2025-01-15');
    });
  });

  describe('Animation', () => {
    it('should apply animation delay based on index', () => {
      const { container } = render(
        <Card
          title="Test"
          href="/test"
          index={5}
        />
      );

      const article = container.querySelector('article');
      expect(article).toHaveStyle({ animationDelay: '500ms' });
    });

    it('should default to index 0 when not provided', () => {
      const { container } = render(
        <Card title="Test" href="/test" />
      );

      const article = container.querySelector('article');
      expect(article).toHaveStyle({ animationDelay: '0ms' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      render(
        <Card
          title="Test Title"
          description="Test description"
          href="/test"
        />
      );

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('should have accessible time element', () => {
      render(
        <Card
          title="Test Title"
          href="/test"
          date="2025-01-15"
        />
      );

      const time = screen.getByRole('time');
      expect(time).toHaveAttribute('dateTime', '2025-01-15');
    });

    it('should render icon without breaking accessibility', () => {
      render(
        <Card
          title="Test Title"
          href="/test"
          icon="🎨"
        />
      );

      // Icon should be present
      expect(screen.getByText('🎨')).toBeInTheDocument();
      // Link should still be accessible
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });
});
