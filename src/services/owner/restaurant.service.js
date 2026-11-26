import { randomUUID } from "crypto";
import { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.js";

export async function create({
  adminId,
  name,
  cnpj,
  phone,
  category_id,
  delivery_fee,
  opening_hours,
  address,
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

  const addressRecord = await prisma.address.create({
    data: {
      id: randomUUID(),
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      cep: address.cep,
      complement: address.complement || null,
      isDefault: false,
    },
  });

  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        id: randomUUID(),
        adminId,
        name,
        cnpj,
        phone,
        addressId: addressRecord.id,
        categoryId: category_id || null,
        openingHours: opening_hours ? JSON.stringify(opening_hours) : null,
        deliveryFee: delivery_fee ?? 0,
        status: "active",
      },
    });

    return {
      id: restaurant.id,
      name: restaurant.name,
      cnpj: restaurant.cnpj,
      phone: restaurant.phone,
      category_id: restaurant.categoryId,
      delivery_fee: Number(restaurant.deliveryFee),
      status: restaurant.status,
      address_id: restaurant.addressId,
      created_at: restaurant.createdAt,
    };
  } catch (error) {
    await prisma.address.delete({ where: { id: addressRecord.id } }).catch(() => {});

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const err = new Error("CNPJ já cadastrado");
      err.statusCode = 400;
      throw err;
    }

    throw error;
  }
}
