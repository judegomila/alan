import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const FrontmatterSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
});

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
}

const LOG_DIR = join(process.cwd(), "data", "log");

export function getPosts(): Post[] {
  const files = readdirSync(LOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const posts = files.map((file) => {
    const { data, content } = matter(readFileSync(join(LOG_DIR, file), "utf8"));
    const parsed = FrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in data/log/${file}: ${parsed.error.message}`);
    }
    return {
      slug: file.replace(/\.mdx?$/, ""),
      ...parsed.data,
      content,
    };
  });
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
