import { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { Header } from "@/components/common/Header";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "생각과 경험을 기록하는 블로그",
  openGraph: {
    title: "Blog | junogarden",
    description: "생각과 경험을 기록하는 블로그",
  },
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const allTags = getAllTags();

  return (
    <div className="min-h-screen">
      <Header backLink="/" backLabel="junogarden" />

      <main id="main-content" className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary hover:scale-105 transition-transform duration-300 inline-block">
            Blog
          </h1>

          <BlogClient allPosts={allPosts} allTags={allTags} />
        </div>
      </main>
    </div>
  );
}
