import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

const handleWebHook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;
        const paymentId = session.metadata?.paymentId;

        if (!appointmentId || !paymentId) {
          console.error("❌ Missing metadata - appointmentId or paymentId");
          throw new Error("Missing required metadata");
        }

        const isPaid =
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required";

        const paymentStatus = isPaid
          ? PaymentStatus.PAID
          : PaymentStatus.UNPAID;

        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus: paymentStatus,
          },
        });
        
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: paymentStatus,
            paymentGatewayData: session as any,
          },
        });
        
        return {
          success: true,
          appointmentId,
          paymentId,
        };
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed: ", intent.id);
        await prisma.payment.update({
          where: {
            id: intent.metadata?.paymentId,
          },
          data: {
            status: PaymentStatus.UNPAID,
          },
        });
        break;
      }
      default:
        console.error(`Unhandled event type: ${event.type}`);
        return { success: true };
    }
  } catch (error) {
    console.error("Error in handleWebHook:", error);
    throw error;
  }
};

export const PaymentServices = {
  handleWebHook,
};
