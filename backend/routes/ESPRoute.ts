import type { FastifyInstance } from "fastify";
import { EspController } from "../controllers/EspController";

const ESPROUTE = {
  lightStatus: "/esp/light/status",
};

export const ESPRoute = async (app: FastifyInstance) => {
  const prisma = app.prisma; // Access the Prisma client from the Fastify instance
  const espController: EspController = new EspController(prisma);
  app.get(
    ESPROUTE.lightStatus,
    espController.getLightStatus.bind(espController)
  );
};
