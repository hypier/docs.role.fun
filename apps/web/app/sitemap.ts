import { MetadataRoute } from "next";
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(
  process.env["NEXT_PUBLIC_CONVEX_URL"] as string,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const characters = await client.query(api.characters.listBackend, {});

  return [
    {
      url: "https://openroleplay.ai",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://openroleplay.ai/models",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://openroleplay.ai/shop",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://empty.app/filter-templates",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...characters.map((character) => ({
      url: `https://openroleplay.ai/character/${character._id}`,
      lastModified: new Date(character.updatedAt),
      changeFrequency: "weekly" as "weekly",
      priority: 0.8,
    })),
  ];
}
