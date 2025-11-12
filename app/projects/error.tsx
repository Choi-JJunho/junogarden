"use client";

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
          프로젝트를 불러올 수 없습니다
        </h2>
        <p className="text-foreground/70 mb-6">
          프로젝트 목록을 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
