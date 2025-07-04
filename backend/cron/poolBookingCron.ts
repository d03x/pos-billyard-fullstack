// src/cron.ts
import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { PrismaClient } from "../generated/prisma";
process.env.TZ = "Asia/Jakarta"; // Atau timezone Anda
const prisma = new PrismaClient();

export async function setupBookingCronJobs(app: FastifyInstance) {
  // Jalankan setiap menit
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      app.log.info(`Running booking cron job at ${now.toISOString()}`);

      //handle to progress to

      const bookingsToStart = await prisma.poolBookings.findMany({
        where: {
          AND: [
            { startTime: { lte: now } },
            { endTime: { gt: now } },
            { status: "Reserved" }, // Only update if still in Reserved status
          ],
        },
        include: {
          poolTable: true,
        },
      });

      if (bookingsToStart.length > 0) {
        await prisma.$transaction([
          // Update bookings to InProgress
          ...bookingsToStart.map((booking) =>
            prisma.poolBookings.update({
              where: { id: booking.id },
              data: { status: "InProgress" },
            })
          ),
          // Update associated tables to Occupied
          ...bookingsToStart.map((booking) =>
            prisma.poolTables.update({
              where: { id: booking.tableId },
              data: { status: "Occupied" },
            })
          ),
        ]);
        app.log.info(`[CRON] Started ${bookingsToStart.length} bookings`);
      }

      const table = await prisma.poolTables.findMany({
        include: {
          PoolBookings: true,
        },
      });

      async function updateAvailable(id: number) {
        await prisma.$transaction([
          prisma.poolTables.update({
            where: {
              id: id,
            },
            data: {
              status: "Available",
            },
          }),
        ]);
      }
      table.forEach(async (e) => {
        if (e.PoolBookings.length == 0) {
          updateAvailable(e.id);
        } else {
          const active = e.PoolBookings.find(
            (e) => e.status != "Completed" && e.status != "Cancelled"
          );

          if (!active && e.status != "Available") {
            updateAvailable(e.id);
          }
        }
      });

      const expiredBookings = await prisma.poolBookings.findMany({
        where: {
          AND: [
            { endTime: { lte: now } },
            { status: { in: ["Reserved", "InProgress"] } },
            // Tambahan validasi: startTime harus sudah lewat juga
            { startTime: { lte: now } },
          ],
        },
        include: {
          poolTable: true,
        },
      });

      app.log.info(
        `Found ${expiredBookings.length} expired bookings to process`
      );

      // 2. Proses update status
      for (const booking of expiredBookings) {
        try {
          await prisma.$transaction([
            // Update status booking ke Completed
            prisma.poolBookings.update({
              where: { id: booking.id },
              data: {
                status: "Completed",
                // Jika perlu, update endTime ke waktu sekarang
                // endTime: now
              },
            }),
            // Update status meja ke Available
            prisma.poolTables.update({
              where: { id: booking.tableId },
              data: { status: "Available" },
            }),
          ]);

          app.log.info(
            `Successfully auto-completed booking ${booking.id} for table ${booking.poolTable.name}`
          );
        } catch (txError) {
          app.log.error(`Failed to process booking ${booking.id}:`, txError);
        }
      }

      // 3. Handle booking yang sudah mulai tapi belum selesai (InProgress)
      const activeBookings = await prisma.poolBookings.findMany({
        where: {
          AND: [
            { startTime: { lte: now } },
            { endTime: { gt: now } },
            { status: "InProgress" },
          ],
        },
        include: {
          poolTable: true,
        },
      });

      app.log.info(`Found ${activeBookings.length} active bookings`);
    } catch (error) {
      app.log.error("Error in booking cron job:", error);
    }
  });
}
