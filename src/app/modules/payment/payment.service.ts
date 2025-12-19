import Stripe from "stripe";

const handleWebHook = async(event: Stripe.Event)=>{
    switch (event.type){
        case "checkout.session.completed": {
            const session = event.data.object;
            const appointmentId = session.metadata?.appointmentId;
            const paymentIndentId = session.payment_intent;
            const email = session.customer_email;

            console.log("Payment Successfully");
            console.log("AppointmentID : ", appointmentId);
            console.log("Payment Intent : ", paymentIndentId);
            console.log("Customer Email : ", email);

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