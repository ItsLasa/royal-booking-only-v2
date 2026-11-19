"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireHolds = expireHolds;
exports.getReservedCount = getReservedCount;
exports.assertAvailable = assertAvailable;
exports.getOccupiedDateRanges = getOccupiedDateRanges;
const apiResponse_1 = require("../lib/apiResponse");
async function expireHolds(prisma, now = new Date()) {
    return prisma.booking.updateMany({
        where: { bookingStatus: { in: ["HOLD", "PENDING_PAYMENT"] }, expiresAt: { lt: now }, paymentStatus: { in: ["UNPAID", "FAILED"] } },
        data: { bookingStatus: "EXPIRED" },
    });
}
async function getReservedCount(prisma, unitId, checkInDate, checkOutDate) {
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
async function assertAvailable(prisma, unitId, checkInDate, checkOutDate) {
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit || !unit.active)
        throw new apiResponse_1.ApiError(404, "UNIT_NOT_FOUND", "The villa unit is not available.");
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
    if (blocks > 0)
        throw new apiResponse_1.ApiError(409, "DATES_UNAVAILABLE", "These dates are blocked for maintenance or an owner hold. Please choose different dates.");
    if (reserved >= unit.inventoryCount)
        throw new apiResponse_1.ApiError(409, "DATES_UNAVAILABLE", "These dates are already booked according to the availability calendar. Please choose different dates.");
    return { available: true, remaining: unit.inventoryCount - reserved };
}
async function getOccupiedDateRanges(prisma, unitId) {
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
