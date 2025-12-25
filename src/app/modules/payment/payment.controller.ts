import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";
import { stripe } from "../../helpers/stripe";
import { PaymentServices } from "./payment.service";

const handleWebHook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret =
    "whsec_74bb87af30169d84fed0e28d6f9e9ed1b27f60246abad73800bcd57b3d9bdad9";
    
  if (!signature) {
    console.error("❌ No stripe-signature header found");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed: ", error.message);
    return res.status(400).send(`Webhook Error:  ${error.message}`);
  }

  try {
    const result = await PaymentServices.handleWebHook(event);
    console.log("✅ Webhook processed successfully:", result);

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return res.status(500).send(`Processing Error: ${error.message}`);
  }
});

export const PaymentControllers = {
  handleWebHook,
};
