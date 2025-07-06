import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface CategoryBody {
  name: string;
}

interface ProductBody {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
}

interface OrderBody {
  customerName?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

// Authentication middleware
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
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

export async function FnbRoute(fastify: FastifyInstance) {
  // Categories CRUD
  
  // Get all categories
  fastify.get("/categories", async (request, reply) => {
    try {
      const categories = await fastify.prisma.category.findMany({
        include: {
          products: true
        }
      });
      reply.send({ categories });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Create category
  fastify.post<{ Body: CategoryBody }>("/categories", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { name } = request.body;

      const category = await fastify.prisma.category.create({
        data: { name }
      });

      reply.status(201).send({
        message: "Category created successfully",
        category
      });
    } catch (error) {
      if (error.code === "P2002") {
        return reply.status(400).send({ error: "Category name already exists" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update category
  fastify.put<{ Params: { id: string }, Body: CategoryBody }>("/categories/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name } = request.body;

      const category = await fastify.prisma.category.update({
        where: { id: parseInt(id) },
        data: { name }
      });

      reply.send({
        message: "Category updated successfully",
        category
      });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Category not found" });
      }
      if (error.code === "P2002") {
        return reply.status(400).send({ error: "Category name already exists" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Delete category
  fastify.delete<{ Params: { id: string } }>("/categories/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      await fastify.prisma.category.delete({
        where: { id: parseInt(id) }
      });

      reply.send({ message: "Category deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Category not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Products CRUD

  // Get all products
  fastify.get("/products", async (request, reply) => {
    try {
      const products = await fastify.prisma.product.findMany({
        include: {
          category: true
        }
      });
      reply.send({ products });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Get products by category
  fastify.get<{ Params: { categoryId: string } }>("/products/category/:categoryId", async (request, reply) => {
    try {
      const { categoryId } = request.params;

      const products = await fastify.prisma.product.findMany({
        where: { categoryId: parseInt(categoryId) },
        include: {
          category: true
        }
      });

      reply.send({ products });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Create product
  fastify.post<{ Body: ProductBody }>("/products", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { name, description, price, categoryId } = request.body;

      const product = await fastify.prisma.product.create({
        data: {
          name,
          description,
          price,
          categoryId
        },
        include: {
          category: true
        }
      });

      reply.status(201).send({
        message: "Product created successfully",
        product
      });
    } catch (error) {
      if (error.code === "P2002") {
        return reply.status(400).send({ error: "Product name already exists" });
      }
      if (error.code === "P2003") {
        return reply.status(400).send({ error: "Category not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update product
  fastify.put<{ Params: { id: string }, Body: ProductBody }>("/products/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, description, price, categoryId } = request.body;

      const product = await fastify.prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          price,
          categoryId
        },
        include: {
          category: true
        }
      });

      reply.send({
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Product not found" });
      }
      if (error.code === "P2002") {
        return reply.status(400).send({ error: "Product name already exists" });
      }
      if (error.code === "P2003") {
        return reply.status(400).send({ error: "Category not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Delete product
  fastify.delete<{ Params: { id: string } }>("/products/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      await fastify.prisma.product.delete({
        where: { id: parseInt(id) }
      });

      reply.send({ message: "Product deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Product not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Orders CRUD

  // Get all orders
  fastify.get("/orders", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const orders = await fastify.prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      reply.send({ orders });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Get order by ID
  fastify.get<{ Params: { id: string } }>("/orders/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const order = await fastify.prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }

      reply.send({ order });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Create order
  fastify.post<{ Body: OrderBody }>("/orders", async (request, reply) => {
    try {
      const { customerName, items } = request.body;

      // Calculate total amount
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await fastify.prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return reply.status(400).send({ error: `Product with ID ${item.productId} not found` });
        }

        const itemTotal = parseFloat(product.price.toString()) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create order with order items
      const order = await fastify.prisma.order.create({
        data: {
          customerName,
          totalAmount,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      reply.status(201).send({
        message: "Order created successfully",
        order
      });
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update order status (if needed)
  fastify.put<{ Params: { id: string }, Body: { customerName?: string } }>("/orders/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { customerName } = request.body;

      const order = await fastify.prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          ...(customerName && { customerName })
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      reply.send({
        message: "Order updated successfully",
        order
      });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Order not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Delete order
  fastify.delete<{ Params: { id: string } }>("/orders/:id", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      // Delete order items first, then order
      await fastify.prisma.orderItem.deleteMany({
        where: { orderId: parseInt(id) }
      });

      await fastify.prisma.order.delete({
        where: { id: parseInt(id) }
      });

      reply.send({ message: "Order deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return reply.status(404).send({ error: "Order not found" });
      }
      reply.status(500).send({ error: "Internal server error" });
    }
  });
}

