import Fastify, { type FastifyInstance } from "fastify";
import { ESPRoute } from "./routes/ESPRoute";
import { PrismaClient } from "./generated/prisma/client";
import { PoolRoutes } from "./routes/PoolRoutes";
import fastifyCors from "@fastify/cors";
import { OrderRoute } from "./routes/OrderRoute";
import { setupBookingCronJobs } from "./cron/poolBookingCron";
const app = Fastify({ logger: true });
const prisma = new PrismaClient()
app.decorate("prisma",prisma);
app.addHook("onClose",async (instance:FastifyInstance)=>{
    await instance.prisma.$disconnect();
})
app.addHook("onReady",async ()=>{
  await setupBookingCronJobs(app)
})
app.register(fastifyCors,{
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
})
app.register(ESPRoute);
app.register(PoolRoutes);
app.register(OrderRoute);
try {
  await app.listen({ port: 5500,host:"0.0.0.0" }, (errr, address) => {
    if (errr) {
      app.log.error(errr);
      process.exit(1);
    } else {
      console.log(`Server Listen: ${address}`);
    }
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
