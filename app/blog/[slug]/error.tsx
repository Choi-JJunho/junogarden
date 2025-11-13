"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError({
      error,
      context: "Blog Post Page",
      metadata: {
        timestamp: new Date().toISOString(),
        pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
      },
    });
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";
  const friendlyMessage = getUserFriendlyErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-primary mb-4">
          글을 불러올 수 없습니다
        </h2>
        <p className="text-foreground/70 mb-6">
          {friendlyMessage}
        </p>

        {isDev && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded text-left text-sm">
            <p className="font-mono text-red-400 mb-2">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-gray-400">Digest: {error.digest}</p>
            )}
          </div>
        )}

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
