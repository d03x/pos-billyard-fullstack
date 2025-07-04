import type { FastifyInstance } from "fastify";
import { EspController } from "../controllers/EspController";
import { PoolController } from "../controllers/PoolController";

export const PoolRoutes = async (app: FastifyInstance) => {
  const prisma = app.prisma; // Access the Prisma client from the Fastify instance
  const TableController: PoolController = new PoolController(prisma);
  app.get("/api/pool-tables", TableController.get.bind(TableController));
  app.put("/api/create-booking", TableController.createBooking.bind(TableController));
  app.put("/api/pool-tables/booking/extend-time",TableController.extendHourBooking.bind(TableController))
    app.put("/api/pool-tables/booking/end-session",TableController.endBookingSession.bind(TableController))
  app.get("/api/pool/get-all-bookings", TableController.getAllBookingHistory.bind(TableController))
};
