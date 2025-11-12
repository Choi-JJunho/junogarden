"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-primary mb-4">
          글을 불러올 수 없습니다
        </h2>
        <p className="text-foreground/70 mb-6">
          블로그 포스트를 불러오는 중 오류가 발생했습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            다시 시도
          </button>
          <Link
            href="/blog"
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
