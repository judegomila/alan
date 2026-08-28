import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPost, getPosts } from "@/lib/log";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return (
    <article>
      <div className="font-mono text-xs text-zinc-500">{post.date}</div>
      <h1 className="mt-1 mb-6 text-3xl font-bold text-zinc-100">{post.title}</h1>
      <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-zinc-300 [&_a]:text-amber-400 [&_code]:font-mono [&_code]:text-amber-300 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-100 [&_li]:ml-5 [&_ol]:list-decimal [&_strong]:text-zinc-100 [&_ul]:list-disc">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
