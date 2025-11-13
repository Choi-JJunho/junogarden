import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserFriendlyErrorMessage } from '../error-logger';

describe('getUserFriendlyErrorMessage', () => {
  it('should return user-friendly message for ENOENT error', () => {
    const error = new Error('ENOENT: no such file or directory');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('파일을 찾을 수 없습니다.');
  });

  it('should return user-friendly message for EACCES error', () => {
    const error = new Error('EACCES: permission denied');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('파일 접근 권한이 없습니다.');
  });

  it('should return user-friendly message for fetch error', () => {
    const error = new Error('fetch failed: network error');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('네트워크 연결에 문제가 있습니다.');
  });

  it('should return user-friendly message for timeout error', () => {
    const error = new Error('Request timeout exceeded');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('요청 시간이 초과되었습니다.');
  });

  it('should return default message for unknown error', () => {
    const error = new Error('Some unknown error');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('예상치 못한 오류가 발생했습니다.');
  });

  it('should handle error without specific keywords', () => {
    const error = new Error('Generic error message');
    const message = getUserFriendlyErrorMessage(error);
    expect(message).toBe('예상치 못한 오류가 발생했습니다.');
  });
});
