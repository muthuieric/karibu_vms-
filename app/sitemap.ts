import type { MetadataRoute } from "next";
import { publicPages, siteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    url: `${siteUrl}${page.path === "/" ? "" : page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
