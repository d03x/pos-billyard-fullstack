import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
const midtransClient = require('midtrans-client');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Midtrans configuration
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || '', // Leave empty for now as requested
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''  // Leave empty for now as requested
});

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

interface CreatePaymentBody {
  orderId: number;
  paymentMethod?: string;
}

interface PaymentNotificationBody {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id: string;
  fraud_status?: string;
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

export async function PaymentRoute(fastify: FastifyInstance) {
  // Create payment transaction
  fastify.post<{ Body: CreatePaymentBody }>("/payment/create", async (request, reply) => {
    try {
      const { orderId, paymentMethod } = request.body;

      // Get order details
      const order = await fastify.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }

      // Check if Midtrans keys are configured
      if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
        return reply.status(500).send({ 
          error: "Midtrans API keys not configured",
          message: "Please configure MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY environment variables"
        });
      }

      // Prepare transaction details for Midtrans
      const transactionDetails = {
        transaction_details: {
          order_id: `ORDER-${order.id}-${Date.now()}`,
          gross_amount: parseInt(order.totalAmount.toString())
        },
        customer_details: {
          first_name: order.customerName || "Customer",
          email: "customer@example.com" // You might want to add email to order model
        },
        item_details: order.orderItems.map(item => ({
          id: item.product.id,
          price: parseInt(item.price.toString()),
          quantity: item.quantity,
          name: item.product.name
        })),
        credit_card: {
          secure: true
        }
      };

      // Create transaction with Midtrans
      const transaction = await snap.createTransaction(transactionDetails);

      reply.send({
        message: "Payment transaction created successfully",
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: transactionDetails.transaction_details.order_id
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      reply.status(500).send({ 
        error: "Failed to create payment transaction",
        details: error.message
      });
    }
  });

  // Handle payment notification from Midtrans
  fastify.post<{ Body: PaymentNotificationBody }>("/payment/notification", async (request, reply) => {
    try {
      const notification = request.body;

      // Check if Midtrans keys are configured
      if (!process.env.MIDTRANS_SERVER_KEY) {
        return reply.status(500).send({ 
          error: "Midtrans server key not configured"
        });
      }

      // Verify notification authenticity
      const statusResponse = await coreApi.transaction.notification(notification);

      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

      // Handle different transaction statuses
      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          // TODO: Set payment status in your database to 'challenge'
          console.log('Transaction is challenged');
        } else if (fraudStatus === 'accept') {
          // TODO: Set payment status in your database to 'success'
          console.log('Transaction is successful');
        }
      } else if (transactionStatus === 'settlement') {
        // TODO: Set payment status in your database to 'success'
        console.log('Transaction is settled');
      } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        // TODO: Set payment status in your database to 'failure'
        console.log('Transaction is cancelled/denied/expired');
      } else if (transactionStatus === 'pending') {
        // TODO: Set payment status in your database to 'pending'
        console.log('Transaction is pending');
      }

      reply.send({ status: 'ok' });
    } catch (error) {
      console.error("Payment notification error:", error);
      reply.status(500).send({ error: "Failed to process payment notification" });
    }
  });

  // Check payment status
  fastify.get<{ Params: { orderId: string } }>("/payment/status/:orderId", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { orderId } = request.params;

      // Check if Midtrans keys are configured
      if (!process.env.MIDTRANS_SERVER_KEY) {
        return reply.status(500).send({ 
          error: "Midtrans server key not configured"
        });
      }

      // Get transaction status from Midtrans
      const statusResponse = await coreApi.transaction.status(orderId);

      reply.send({
        order_id: statusResponse.order_id,
        transaction_status: statusResponse.transaction_status,
        payment_type: statusResponse.payment_type,
        transaction_time: statusResponse.transaction_time,
        gross_amount: statusResponse.gross_amount
      });
    } catch (error) {
      console.error("Payment status check error:", error);
      reply.status(500).send({ 
        error: "Failed to check payment status",
        details: error.message
      });
    }
  });

  // Cancel payment
  fastify.post<{ Params: { orderId: string } }>("/payment/cancel/:orderId", {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { orderId } = request.params;

      // Check if Midtrans keys are configured
      if (!process.env.MIDTRANS_SERVER_KEY) {
        return reply.status(500).send({ 
          error: "Midtrans server key not configured"
        });
      }

      // Cancel transaction in Midtrans
      const cancelResponse = await coreApi.transaction.cancel(orderId);

      reply.send({
        message: "Payment cancelled successfully",
        order_id: cancelResponse.order_id,
        transaction_status: cancelResponse.transaction_status
      });
    } catch (error) {
      console.error("Payment cancellation error:", error);
      reply.status(500).send({ 
        error: "Failed to cancel payment",
        details: error.message
      });
    }
  });

  // Get payment methods (for frontend)
  fastify.get("/payment/methods", async (request, reply) => {
    try {
      const paymentMethods = [
        {
          id: "credit_card",
          name: "Credit Card",
          description: "Pay with Visa, MasterCard, JCB"
        },
        {
          id: "bank_transfer",
          name: "Bank Transfer",
          description: "Transfer via ATM, Internet Banking, Mobile Banking"
        },
        {
          id: "echannel",
          name: "Mandiri Bill Payment",
          description: "Pay via Mandiri ATM or Internet Banking"
        },
        {
          id: "permata",
          name: "Permata Virtual Account",
          description: "Pay via Permata ATM or Internet Banking"
        },
        {
          id: "bca_va",
          name: "BCA Virtual Account",
          description: "Pay via BCA ATM or m-BCA"
        },
        {
          id: "bni_va",
          name: "BNI Virtual Account",
          description: "Pay via BNI ATM or Internet Banking"
        },
        {
          id: "bri_va",
          name: "BRI Virtual Account",
          description: "Pay via BRI ATM or Internet Banking"
        },
        {
          id: "gopay",
          name: "GoPay",
          description: "Pay with GoPay e-wallet"
        },
        {
          id: "shopeepay",
          name: "ShopeePay",
          description: "Pay with ShopeePay e-wallet"
        },
        {
          id: "qris",
          name: "QRIS",
          description: "Pay with any QRIS-enabled app"
        }
      ];

      reply.send({ paymentMethods });
    } catch (error) {
      reply.status(500).send({ error: "Failed to get payment methods" });
    }
  });
}

