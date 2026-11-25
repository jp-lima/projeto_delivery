import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma.js";

export async function create({
  restaurantId,
  name,
  description,
  price,
  available,
  category_id,
}) {
  if (category_id) {
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      const error = new Error("Categoria não encontrada");
      error.statusCode = 400;
      throw error;
    }
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      id: randomUUID(),
      restaurantId,
      name,
      description,
      price,
      available,
      categoryId: category_id || null,
    },
  });

  return {
    id: menuItem.id,
    restaurant_id: menuItem.restaurantId,
    name: menuItem.name,
    description: menuItem.description,
    price: Number(menuItem.price),
    available: menuItem.available,
    category_id: menuItem.categoryId,
    created_at: menuItem.createdAt,
  };
}

export async function list({ restaurantId, filters }) {
  const where = { restaurantId };

  if (filters.name) {
    where.name = { contains: filters.name };
  }

  if (filters.category_id) {
    where.categoryId = filters.category_id;
  }

  if (filters.available !== undefined) {
    where.available = filters.available === "true" || filters.available === true;
  }

  const [menuItems, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuItem.count({ where }),
  ]);

  return {
    data: menuItems.map((item) => ({
      id: item.id,
      restaurant_id: item.restaurantId,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      available: item.available,
      category: item.category?.name || null,
      created_at: item.createdAt,
    })),
    total,
  };
}

export async function update({ id, restaurantId, data }) {
  const menuItem = await prisma.menuItem.findFirst({
    where: { id, restaurantId },
  });

  if (!menuItem) {
    const error = new Error("Item não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (data.category_id !== undefined && data.category_id !== null) {
    const category = await prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      const error = new Error("Categoria não encontrada");
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.available !== undefined && { available: data.available }),
      ...(data.category_id !== undefined && { categoryId: data.category_id }),
    },
  });

  return {
    id: updated.id,
    restaurant_id: updated.restaurantId,
    name: updated.name,
    description: updated.description,
    price: Number(updated.price),
    available: updated.available,
    category_id: updated.categoryId,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  };
}

export async function remove({ id, restaurantId }) {
  const menuItem = await prisma.menuItem.findFirst({
    where: { id, restaurantId },
  });

  if (!menuItem) {
    const error = new Error("Item não encontrado");
    error.statusCode = 404;
    throw error;
  }

  await prisma.menuItem.delete({
    where: { id },
  });
}
