import { prisma } from "../lib/prisma.js";

export async function list() {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.count(),
  ]);

  return {
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      created_at: category.createdAt,
    })),
    total,
  };
}
