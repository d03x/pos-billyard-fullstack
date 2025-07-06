import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdateProfileBody {
  name?: string;
  email?: string;
}

interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export async function AuthRoute(fastify: FastifyInstance) {
  // Register
  fastify.post<{ Body: RegisterBody }>("/auth/register", async (request, reply) => {
    try {
      const { email, password, name } = request.body;

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return reply.status(400).send({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await fastify.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      reply.send({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Login
  fastify.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Find user
      const user = await fastify.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      reply.send({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Get current user profile
  fastify.get("/auth/profile", {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return reply.status(401).send({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        request.user = decoded;
      } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
      }
    }
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      reply.send({ user });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update profile
  fastify.put<{ Body: UpdateProfileBody }>("/auth/profile", {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return reply.status(401).send({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        request.user = decoded;
      } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
      }
    }
  }, async (request, reply) => {
    try {
      const { name, email } = request.body;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await fastify.prisma.user.findUnique({
          where: { email }
        });

        if (existingUser && existingUser.id !== request.user.userId) {
          return reply.status(400).send({ error: "Email already taken" });
        }
      }

      const updatedUser = await fastify.prisma.user.update({
        where: { id: request.user.userId },
        data: {
          ...(name && { name }),
          ...(email && { email })
        },
        select: {
          id: true,
          email: true,
          name: true,
          updatedAt: true
        }
      });

      reply.send({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update password
  fastify.put<{ Body: UpdatePasswordBody }>("/auth/password", {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return reply.status(401).send({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        request.user = decoded;
      } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
      }
    }
  }, async (request, reply) => {
    try {
      const { currentPassword, newPassword } = request.body;

      // Get current user
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId }
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return reply.status(400).send({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await fastify.prisma.user.update({
        where: { id: request.user.userId },
        data: { password: hashedNewPassword }
      });

      reply.send({ message: "Password updated successfully" });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });
}

