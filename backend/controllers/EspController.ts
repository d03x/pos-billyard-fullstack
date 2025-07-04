import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "../generated/prisma";

export class EspController {
  constructor(private prisma: PrismaClient) {}
  /**
   * getLights
   */
  public async getLightStatus() {
    const lights = await this.prisma.poolTables.findMany({
      include: {
        PoolBookings: true,
      },
    });
    return lights.map((data) => {
      const activeBooking = data.PoolBookings?.find(
        (booking) =>
          booking.status !== "Completed" && booking.status !== "Cancelled"
      );
      return {
        ...data,
        light_status: activeBooking ? "ON" : "OFF",
      };
    });
  }
}
