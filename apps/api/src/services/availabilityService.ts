import { PrismaClient } from "@prisma/client";
import { ApiError } from "../lib/apiResponse";

export async function expireHolds(prisma: PrismaClient, now = new Date()) {
  return prisma.booking.updateMany({
    where: { bookingStatus: { in: ["HOLD", "PENDING_PAYMENT"] }, expiresAt: { lt: now }, paymentStatus: { in: ["UNPAID", "FAILED"] } },
    data: { bookingStatus: "EXPIRED" },
  });
}

export async function getReservedCount(prisma: PrismaClient, unitId: string, checkInDate: Date, checkOutDate: Date) {
  await expireHolds(prisma);
  const now = new Date();
  return prisma.booking.count({
    where: {
      unitId,
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate },
      OR: [
        { bookingStatus: { in: ["CONFIRMED", "COMPLETED"] } },
        {
          bookingStatus: { in: ["HOLD", "PENDING_PAYMENT", "PAYMENT_PROCESSING"] },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
    },
  });
}

export async function assertAvailable(prisma: PrismaClient, unitId: string, checkInDate: Date, checkOutDate: Date) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit || !unit.active) throw new ApiError(404, "UNIT_NOT_FOUND", "The villa unit is not available.");
  const [reserved, blocks] = await Promise.all([
    getReservedCount(prisma, unitId, checkInDate, checkOutDate),
    prisma.availabilityBlock.count({
      where: {
        unitId,
        startDate: { lt: checkOutDate },
        endDate: { gte: checkInDate },
      },
    }),
  ]);
  if (blocks > 0) throw new ApiError(409, "DATES_UNAVAILABLE", "These dates are blocked for maintenance or an owner hold. Please choose different dates.");
  if (reserved >= unit.inventoryCount) throw new ApiError(409, "DATES_UNAVAILABLE", "These dates are already booked according to the availability calendar. Please choose different dates.");
  return { available: true, remaining: unit.inventoryCount - reserved };
}

export async function getOccupiedDateRanges(prisma: PrismaClient, unitId: string) {
  await expireHolds(prisma);
  const now = new Date();
  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        unitId,
        checkOutDate: { gte: now },
        OR: [
          { bookingStatus: { in: ["CONFIRMED", "COMPLETED"] } },
          {
            bookingStatus: { in: ["HOLD", "PENDING_PAYMENT", "PAYMENT_PROCESSING"] },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
      select: { checkInDate: true, checkOutDate: true },
      orderBy: { checkInDate: "asc" },
    }),
    prisma.availabilityBlock.findMany({
      where: {
        unitId,
        endDate: { gte: now },
      },
      select: { startDate: true, endDate: true, reason: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      checkInDate: b.checkInDate.toISOString().slice(0, 10),
      checkOutDate: b.checkOutDate.toISOString().slice(0, 10),
    })),
    blocks: blocks.map((b) => ({
      startDate: b.startDate.toISOString().slice(0, 10),
      endDate: b.endDate.toISOString().slice(0, 10),
      reason: b.reason,
    })),
  };
}
