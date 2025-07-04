import type { FastifyInstance } from "fastify";
import { EspController } from "../controllers/EspController";
import { PoolController } from "../controllers/PoolController";

export const OrderRoute = async (app: FastifyInstance) => {
  const prisma = app.prisma; // Access the Prisma client from the Fastify instance



};
