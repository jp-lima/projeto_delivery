import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma.js";
import { httpError } from "../../utils/httpError.js";

const INVALID_ORDER_MSG = "Itens inválidos ou restaurante fechado";

const toCents = (value) => Math.round(Number(value) * 100);
const fromCents = (cents) => cents / 100;

// TASK 3 — GET /orders
export async function list({ customerId, filters }) {
  const { status, start_date, end_date, page, limit } = filters;

  const where = { customerId };

  if (status) where.status = status;

  if (start_date || end_date) {
    where.createdAt = {
      ...(start_date && { gte: start_date }),
      ...(end_date && { lte: end_date }),
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { restaurant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((order) => ({
      id: order.id,
      restaurant_name: order.restaurant.name,
      status: order.status,
      total: Number(order.total),
      created_at: order.createdAt,
    })),
    total,
  };
}

// TASK 4 — POST /orders
export async function create({ customerId, data }) {
  const { restaurant_id, address_id, items, payment_method, notes, discount } =
    data;

  // Junta itens repetidos (mesmo menu_item_id) somando as quantidades
  const quantities = new Map();
  for (const item of items) {
    quantities.set(
      item.menu_item_id,
      (quantities.get(item.menu_item_id) ?? 0) + item.quantity,
    );
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurant_id },
  });
  if (!restaurant || restaurant.status !== "active") {
    throw httpError(400, INVALID_ORDER_MSG);
  }

  // O endereço precisa pertencer ao cliente logado
  const address = await prisma.address.findFirst({
    where: { id: address_id, userId: customerId },
  });
  if (!address) throw httpError(400, "Endereço inválido");

  // Preço e disponibilidade vêm do banco, nunca do cliente
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      restaurantId: restaurant_id,
      available: true,
    },
  });
  if (menuItems.length !== quantities.size) {
    throw httpError(400, INVALID_ORDER_MSG);
  }
  const menuItemsById = new Map(menuItems.map((m) => [m.id, m]));

  // Cálculo em centavos para evitar erro de ponto flutuante
  const orderItems = [...quantities].map(([menuItemId, quantity]) => {
    const menuItem = menuItemsById.get(menuItemId);
    const unitCents = toCents(menuItem.price);
    return {
      id: randomUUID(),
      menuItemId,
      name: menuItem.name,
      unitCents,
      quantity,
      subtotalCents: unitCents * quantity,
    };
  });

  const itemsCents = orderItems.reduce((sum, i) => sum + i.subtotalCents, 0);
  const deliveryFeeCents = toCents(restaurant.deliveryFee);
  const discountCents = toCents(discount);

  if (discountCents > itemsCents) {
    throw httpError(400, "Desconto maior que o valor dos itens");
  }

  const totalCents = itemsCents + deliveryFeeCents - discountCents;
  const orderId = randomUUID();

  // Pedido, itens e pagamento são criados juntos (operação atômica)
  const order = await prisma.order.create({
    data: {
      id: orderId,
      customerId,
      restaurantId: restaurant_id,
      addressId: address_id,
      status: "PENDING",
      total: fromCents(totalCents),
      deliveryFee: fromCents(deliveryFeeCents),
      discount: fromCents(discountCents),
      notes: notes ?? null,
      items: {
        create: orderItems.map((i) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          unitPrice: fromCents(i.unitCents),
          quantity: i.quantity,
          subtotal: fromCents(i.subtotalCents),
        })),
      },
      payment: {
        create: {
          id: randomUUID(),
          method: payment_method,
          amount: fromCents(totalCents),
          status: "pending",
        },
      },
    },
  });

  return {
    id: order.id,
    customer_id: order.customerId,
    restaurant_id: order.restaurantId,
    address_id: order.addressId,
    status: order.status,
    total: fromCents(totalCents),
    delivery_fee: fromCents(deliveryFeeCents),
    discount: fromCents(discountCents),
    payment_method,
    items: orderItems.map((i) => ({
      id: i.id,
      menu_item_id: i.menuItemId,
      name: i.name,
      unit_price: fromCents(i.unitCents),
      quantity: i.quantity,
      subtotal: fromCents(i.subtotalCents),
    })),
    notes: order.notes,
    created_at: order.createdAt,
  };
}