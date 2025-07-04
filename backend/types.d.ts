import { FastifyInstance } from 'fastify'
import type { PrismaClient } from './generated/prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export {}