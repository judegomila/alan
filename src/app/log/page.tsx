import Link from "next/link";
import { getPosts } from "@/lib/log";

export const metadata = { title: "Build Log — ALAN" };

export default function LogPage() {
  const posts = getPosts();
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-zinc-100">Build Log</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/log/${post.slug}`}
            className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600"
          >
            <div className="font-mono text-xs text-zinc-500">{post.date}</div>
            <h2 className="mt-1 font-bold text-zinc-100">{post.title}</h2>
            <div className="mt-2 flex gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
