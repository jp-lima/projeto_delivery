import { randomUUID } from "crypto";
import { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.js";

export async function updateStatus(id, status) {
  const validStatuses = ["active", "inactive", "closed"];

  if (!validStatuses.includes(status)) {
    const error = new Error("Status inválido");
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.restaurant.update({
    where: { id },
    data: { status },
  });

  return {
    id: updated.id,
    status: updated.status,
    updated_at: updated.updatedAt,
  };
}

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

export async function update({ id, name, cnpj, phone, category_id, delivery_fee, opening_hours, address }) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { address: true },
  });

  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (category_id !== undefined && category_id !== null) {
    const category = await prisma.category.findUnique({ where: { id: category_id } });
    if (!category) {
      const error = new Error("Categoria não encontrada");
      error.statusCode = 400;
      throw error;
    }
  }

  if (address) {
    await prisma.address.update({
      where: { id: restaurant.addressId },
      data: {
        ...(address.street !== undefined && { street: address.street }),
        ...(address.number !== undefined && { number: address.number }),
        ...(address.neighborhood !== undefined && { neighborhood: address.neighborhood }),
        ...(address.city !== undefined && { city: address.city }),
        ...(address.state !== undefined && { state: address.state }),
        ...(address.cep !== undefined && { cep: address.cep }),
        ...(address.complement !== undefined && { complement: address.complement }),
      },
    });
  }

  try {
    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(cnpj !== undefined && { cnpj }),
        ...(phone !== undefined && { phone }),
        ...(category_id !== undefined && { categoryId: category_id }),
        ...(delivery_fee !== undefined && { deliveryFee: delivery_fee }),
        ...(opening_hours !== undefined && {
          openingHours: opening_hours ? JSON.stringify(opening_hours) : null,
        }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      delivery_fee: Number(updated.deliveryFee),
      updated_at: updated.updatedAt,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const err = new Error("CNPJ já cadastrado");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
}
