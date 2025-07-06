import { FastifyInstance, FastifyRequest } from 'fastify'
import type { PrismaClient } from './generated/prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
  
  interface FastifyRequest {
    user?: {
      userId: number;
    }
  }
}

export {}