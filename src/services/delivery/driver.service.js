import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma.js";
import { httpError } from "../../utils/httpError.js";

const FINALIZED_STATUSES = ["DELIVERED", "CANCELLED", "REJECTED"];

const toCents = (value) => Math.round(Number(value ?? 0) * 100);
const fromCents = (cents) => cents / 100;
const roundMoney = (value) => fromCents(toCents(value));

function formatAddress(address) {
  if (!address) return null;

  const streetAndNumber = [address.street, address.number]
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .map((part) => part.trim())
    .join(", ");

  const neighborhood =
    typeof address.neighborhood === "string" &&
    address.neighborhood.trim() !== ""
      ? address.neighborhood.trim()
      : null;

  if (streetAndNumber && neighborhood) {
    return `${streetAndNumber} - ${neighborhood}`;
  }

  return streetAndNumber || neighborhood || null;
}

function parseDateBoundary(dateStr, endOfDay = false) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(
      `${dateStr}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
    );
  }
  return new Date(dateStr);
}

function getPeriodStartDate(period) {
  const now = new Date();

  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  return null;
}

export async function registerDriver({ userId, vehicle, license_plate }) {
  const existing = await prisma.deliveryDriver.findUnique({
    where: { userId },
  });

  if (existing) {
    throw httpError(409, "Entregador já cadastrado");
  }

  try {
    const driver = await prisma.deliveryDriver.create({
      data: {
        id: randomUUID(),
        userId,
        vehicle,
        licensePlate: license_plate,
        available: true,
        balance: 0,
      },
    });

    return {
      id: driver.id,
      user_id: driver.userId,
      vehicle: driver.vehicle,
      license_plate: driver.licensePlate,
      available: driver.available,
      balance: roundMoney(driver.balance),
      created_at: driver.createdAt,
    };
  } catch (error) {
    if (error?.code === "P2002") {
      throw httpError(409, "Entregador já cadastrado");
    }
    throw error;
  }
}

export async function updateAvailability({ driverId, available }) {
  const updated = await prisma.deliveryDriver.update({
    where: { id: driverId },
    data: { available },
  });

  return {
    id: updated.id,
    available: updated.available,
    updated_at: updated.updatedAt,
  };
}

export async function listDeliveries({ driverId }) {
  const where = {
    driverId,
    status: {
      notIn: FINALIZED_STATUSES,
    },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        restaurant: { select: { name: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((order) => ({
      id: order.id,
      restaurant_name: order.restaurant?.name ?? null,
      status: order.status,
      customer_address: formatAddress(order.address),
      total: roundMoney(order.total),
      created_at: order.createdAt,
    })),
    total,
  };
}

export async function getDeliveryHistory({ driverId, filters }) {
  const where = {
    driverId,
    status: filters.status ? filters.status : { in: FINALIZED_STATUSES },
  };

  if (filters.start_date || filters.end_date) {
    where.updatedAt = {};
    if (filters.start_date) {
      where.updatedAt.gte = parseDateBoundary(filters.start_date, false);
    }
    if (filters.end_date) {
      where.updatedAt.lte = parseDateBoundary(filters.end_date, true);
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        restaurant: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((order) => ({
      id: order.id,
      restaurant_name: order.restaurant?.name ?? null,
      status: order.status,
      total: roundMoney(order.total),
      delivered_at: order.status === "DELIVERED" ? order.updatedAt : null,
    })),
    total,
  };
}

export async function getEarnings({ driverId, period }) {
  const driver = await prisma.deliveryDriver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw httpError(404, "Cadastro de entregador não encontrado");
  }

  const startDate = getPeriodStartDate(period);
  const where = {
    driverId,
    status: "DELIVERED",
    ...(startDate && { updatedAt: { gte: startDate } }),
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      payment: {
        select: { status: true, paidAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const history = orders.map((order) => ({
    order_id: order.id,
    amount: roundMoney(order.deliveryFee),
    status: (order.payment?.status ?? "pending").toLowerCase(),
    date: order.payment?.paidAt ?? order.updatedAt,
  }));

  const totalEarningsCents = orders.reduce(
    (sum, order) => sum + toCents(order.deliveryFee),
    0,
  );

  return {
    balance: roundMoney(driver.balance),
    total_earnings: fromCents(totalEarningsCents),
    deliveries_count: orders.length,
    period,
    history,
  };
}
