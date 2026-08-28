import { describe, expect, it } from "vitest";
import { getPost, getPosts } from "@/lib/log";

describe("build log", () => {
  it("loads posts sorted newest first with valid frontmatter", () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(1);
    for (const p of posts) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const dates = posts.map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("finds a post by slug and misses unknown slugs", () => {
    const first = getPosts()[0];
    expect(getPost(first.slug)?.title).toBe(first.title);
    expect(getPost("nope")).toBeUndefined();
  });
});
