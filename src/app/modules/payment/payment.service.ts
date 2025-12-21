import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

const handleWebHook = async(event: Stripe.Event)=>{
    switch (event.type){
        case "checkout.session.completed": {
            const session = event.data.object;
            console.log("session",session)
            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            await prisma.appointment.update({
                where:{
                    id: appointmentId
                },
                data:{
                    paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                }
            })
            await prisma.payment.update({
                where:{
                    id: paymentId
                },
                data:{
                    status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                }
            })

            break;
        }
        case "payment_intent.payment_failed": {
            const intent = event.data.object
            console.log("Payment failed: ", intent.id);
            break;
        }
    }
}

export const PaymentServices = {
    handleWebHook
}