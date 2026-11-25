import { prisma } from "../lib/prisma.js";

export async function getById(id) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { address: true, category: true },
  });

  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  let openingHours = null;
  if (restaurant.openingHours) {
    try {
      openingHours = JSON.parse(restaurant.openingHours);
    } catch {
      openingHours = restaurant.openingHours;
    }
  }

  return {
    id: restaurant.id,
    name: restaurant.name,
    cnpj: restaurant.cnpj,
    phone: restaurant.phone,
    category: restaurant.category?.name || null,
    opening_hours: openingHours,
    delivery_fee: Number(restaurant.deliveryFee),
    status: restaurant.status,
    address: {
      street: restaurant.address.street,
      number: restaurant.address.number,
      neighborhood: restaurant.address.neighborhood,
      city: restaurant.address.city,
      state: restaurant.address.state,
      cep: restaurant.address.cep,
      complement: restaurant.address.complement,
    },
    created_at: restaurant.createdAt,
  };
}

export async function list({ name, category_id, status, page, limit }) {
  const where = {};

  if (name) {
    where.name = { contains: name };
  }

  if (category_id) {
    where.categoryId = category_id;
  }

  if (status) {
    where.status = status;
  }

  const take = limit ? Number(limit) : undefined;
  const skip =
    take && page ? (Number(page) - 1) * take : undefined;

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    data: restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category?.name || null,
      delivery_fee: Number(restaurant.deliveryFee),
      status: restaurant.status,
      created_at: restaurant.createdAt,
    })),
    total,
  };
}
