import type { FastifyReply, FastifyRequest } from "fastify";
import { type PrismaClient } from "../generated/prisma/client";
import { formatRupiah } from "../formatRupiah";
import dayjs from "dayjs";
interface CreateBookingRequest {
  customer_name: string;
  tableId: number;
  startTime: string;
  durationHours: number;
  notes: string;
}
export class PoolController {
  constructor(private prisma: PrismaClient) {}

  /**
   * async get
   */
  public async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await this.prisma.poolTables.findMany({
        include: {
          PoolBookings: true,
        },
      });
      return data.map((data) => {
        const order = data.PoolBookings?.find(
          (booking) =>
            booking.status !== "Completed" && booking.status !== "Cancelled"
        );

        const isAvailable = !order || data.status === "Available";

        return {
          ...data,
          PoolBookings: order,
          history: data.PoolBookings,
          isAvailable: isAvailable,
        };
      });
    } catch (error) {
      return error;
    }
  }
  public async getAllBookingHistory(request:FastifyRequest,reply:FastifyReply){
    const data =await this.prisma.poolBookings.findMany({
      include : {
        poolTable:true
      }
    });
    return data;
  }
  public async endBookingSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { bookingId } = request.body as { bookingId: number };

      if (!bookingId) {
        return reply.status(400).send({ error: "Booking ID is required" });
      }

      const booking = await this.prisma.poolBookings.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return reply.status(404).send({ error: "Booking not found" });
      }

      // Update booking status to Completed
      const updatedBooking = await this.prisma.poolBookings.update({
        where: { id: bookingId },
        data: { status: "Completed" },
      });

      // Update table status to Available
      await this.prisma.poolTables.update({
        where: { id: booking.tableId },
        data: { status: "Available" },
      });

      return reply.status(200).send({
        message: "Booking ended successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Error ending booking session:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
  public async extendHourBooking(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { bookingId, hours } = request.body as {
        bookingId: number;
        hours: number;
      };

      if (!bookingId || hours === undefined) {
        return reply.status(400).send({
          error: "Missing required fields: bookingId or hours",
        });
      }

      // 1. Dapatkan booking dengan lock untuk prevent race condition
      const booking: any = await this.prisma.poolBookings.findUnique({
        where: { id: bookingId },
      });

      // 2. Hitung waktu baru dengan presisi
      const currentEndTime = new Date(booking.endTime);
      const newEndTime = new Date(
        currentEndTime.getTime() + hours * 60 * 60 * 1000
      );

      // 3. Update dengan transaction
      const [updatedBooking] = await this.prisma.$transaction([
        this.prisma.poolBookings.update({
          where: { id: bookingId },
          data: {
            endTime: newEndTime,
            durationHours: booking.durationHours + hours,
            totalPrice: booking.totalPrice + booking.hourlyRate * hours,
          },
        }),
        // Jika perlu update table status juga
        this.prisma.poolTables.update({
          where: { id: booking.tableId },
          data: { status: "Occupied" },
        }),
      ]);

      return reply.status(200).send({
        message: "Booking extended successfully",
        booking: {
          ...updatedBooking,
          // Format untuk keperluan display
          endTime: newEndTime.toISOString(),
          durationHours: booking.durationHours + hours,
        },
      });
    } catch (error: any) {
      console.error("Error extending booking:", error);
      return reply.status(500).send({
        error: "Failed to extend booking",
        details: error.message,
      });
    }
  }
  public async createBooking(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { customer_name, tableId, startTime, durationHours, notes } =
        request.body as CreateBookingRequest;

      // Validasi input
      if (!customer_name || !tableId || !startTime || !durationHours) {
        return reply.status(400).send({
          error: "Missing required fields",
          details: {
            customer_name: !customer_name,
            tableId: !tableId,
            startTime: !startTime,
            durationHours: !durationHours,
          },
        });
      }

      // 1. Parse waktu dengan presisi
      const startDate = new Date(startTime);
      const endDate = new Date(
        startDate.getTime() + durationHours * 60 * 60 * 1000
      );

      // 2. Validasi waktu
      if (isNaN(startDate.getTime())) {
        return reply.status(400).send({
          error: "Invalid start time format",
          received: startTime,
        });
      }

      // 3. Cek ketersediaan meja (dengan transaction)
      const [table, overlappingBookings] = await this.prisma.$transaction([
        this.prisma.poolTables.findUnique({
          where: { id: tableId },
        }),
        this.prisma.poolBookings.findMany({
          where: {
            tableId,
            status: { in: ["Reserved", "InProgress"] },
            OR: [
              { startTime: { lt: endDate }, endTime: { gt: startDate } },
              { startTime: { gte: startDate }, endTime: { lte: endDate } },
            ],
          },
        }),
      ]);

      if (!table) {
        return reply.status(404).send({ error: "Table not found" });
      }

      if (table.status !== "Available") {
        return reply.status(409).send({
          error: "Table not available",
          currentStatus: table.status,
        });
      }

      if (overlappingBookings.length > 0) {
        return reply.status(409).send({
          error: "Time slot already booked",
          conflicts: overlappingBookings.map((b) => ({
            id: b.id,
            start: b.startTime,
            end: b.endTime,
            status: b.status,
          })),
        });
      }

      // 4. Hitung harga
      const hourlyRate = Number(table.hourly_rate);
      const totalPrice = hourlyRate * durationHours;

      // 5. Buat booking (dalam transaction)
      const [booking] = await this.prisma.$transaction([
        this.prisma.poolBookings.create({
          data: {
            customer_name,
            tableId,
            startTime: startDate,
            endTime: endDate, // Gunakan endDate yang sudah dihitung
            durationHours,
            hourlyRate,
            totalPrice,
            status: "Reserved",
            notes,
          },
          include: { poolTable: true },
        }),
        this.prisma.poolTables.update({
          where: { id: tableId },
          data: { status: "Occupied" },
        }),
      ]);

      return reply.status(201).send({
        message: "Booking created successfully",
        booking: {
          ...booking,
          totalPrice: formatRupiah(totalPrice),
          hourlyRate: formatRupiah(hourlyRate),
          // Format waktu untuk display
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });
    } catch (error: any) {
      console.error("[CREATE BOOKING ERROR]", error);
      return reply.status(500).send({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
