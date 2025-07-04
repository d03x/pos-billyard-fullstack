import type { FastifyInstance } from "fastify";
import { PoolController } from "../controllers/PoolController";
import { PoolStatsController } from "../controllers/StatistikController";

export const PoolRoutes = async (app: FastifyInstance) => {
  const prisma = app.prisma;

  // Initialize controllers
  const tableController = new PoolController(prisma);
  const statsController = new PoolStatsController(prisma);

  // Pool Tables and Bookings Routes
  app.get("/api/pool-tables", tableController.get.bind(tableController));
  app.put(
    "/api/create-booking",
    tableController.createBooking.bind(tableController)
  );
  app.put(
    "/api/pool-tables/booking/extend-time",
    tableController.extendHourBooking.bind(tableController)
  );
  app.put(
    "/api/pool-tables/booking/end-session",
    tableController.endBookingSession.bind(tableController)
  );
  app.get(
    "/api/pool/get-all-bookings",
    tableController.getAllBookingHistory.bind(tableController)
  );

  // Statistics Routes
  app.get(
    "/api/stats/dashboard",
    statsController.getDashboardStats.bind(statsController)
  );

  app.get(
    "/api/stats/revenue",
    statsController.getRevenueStats.bind(statsController)
  );

  app.get(
    "/api/stats/utilization",
    statsController.getTableUtilization.bind(statsController)
  );
};
