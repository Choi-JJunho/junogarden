import Link from "next/link";

interface CardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  tags?: string[];
  date?: string;
  index?: number;
  type?: "blog" | "project" | "navigation";
}

export function Card({
  title,
  description,
  href,
  icon,
  tags,
  date,
  index = 0,
  type = "blog"
}: CardProps) {
  const isNavigation = type === "navigation";

  return (
    <Link href={href} aria-label={`${title} ${isNavigation ? '페이지로 이동' : '보기'}`}>
      <article
        className={`group relative border-2 border-primary/30 rounded-xl p-6 md:p-8
          hover:border-primary hover:bg-gradient-to-br transition-all duration-300
          cursor-pointer overflow-hidden hover:scale-105 hover:shadow-xl
          ${isNavigation
            ? 'hover:from-primary/10 hover:to-secondary/5 bg-background/90 backdrop-blur-xl'
            : 'hover:from-primary/10 hover:to-transparent bg-background/90 backdrop-blur-sm'
          }`}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'fadeInUp 0.5s ease-out forwards',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>

        <div className="relative z-10">
          {icon && (
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
              {icon}
            </div>
          )}

          <div className="flex items-start justify-between mb-3">
            <h2 className={`font-bold text-primary group-hover:text-secondary transition-colors duration-300 flex-1 ${isNavigation ? 'text-2xl' : 'text-xl md:text-2xl'}`}>
              {title}
            </h2>
            {!icon && type === "project" && (
              <span className="text-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" aria-hidden="true">
                🚀
              </span>
            )}
          </div>

          {date && (
            <time
              className="text-sm text-foreground/50 block mb-3 group-hover:text-foreground/70 transition-colors duration-300"
              dateTime={date}
            >
              {new Date(date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                ...(type === "blog" && { day: "numeric" })
              })}
            </time>
          )}

          {description && (
            <p className="text-foreground/70 mb-4 group-hover:text-foreground transition-colors duration-300 leading-relaxed">
              {description}
            </p>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="태그 목록">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full group-hover:bg-primary/20 transition-colors duration-300"
                  role="listitem"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 mt-auto">
            <span>{isNavigation ? '바로가기' : type === "blog" ? '읽기' : '자세히 보기'}</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
