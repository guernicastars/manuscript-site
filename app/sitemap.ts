import type { MetadataRoute } from "next";
import { getAllChapterMeta } from "@/lib/chapters";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://republic-of-ai-agents.vercel.app";
  const chapters = getAllChapterMeta();

  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((ch) => ({
    url: `${baseUrl}/chapters/${ch.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/graph`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ask`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...chapterRoutes,
  ];
}
