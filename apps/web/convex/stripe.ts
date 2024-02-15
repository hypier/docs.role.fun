"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { crystalDollarPrice } from "./constants";
import { Id } from "./_generated/dataModel";

export const pay = action({
  args: {
    numCrystals: v.union(
      v.literal(150),
      v.literal(1650),
      v.literal(5450),
      v.literal(11200),
      v.literal(19400),
      v.literal(90000),
    ),
    userId: v.id("users"),
  },
  handler: async (
    ctx: any,
    {
      numCrystals,
      userId,
    }: {
      numCrystals: 150 | 1650 | 5450 | 11200 | 19400 | 90000;
      userId: Id<"users">;
    },
  ): Promise<string> => {
    const domain: string =
      process.env.HOSTING_URL ?? "http://localhost:3000/shop";
    const stripe: Stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });
    const paymentId: string = await ctx.runMutation(internal.payments.create, {
      numCrystals,
      userId,
    });
    const user = await ctx.runQuery(internal.users.getUserInternal, {
      id: userId,
    });
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "USD",
              unit_amount_decimal: crystalDollarPrice[numCrystals],
              tax_behavior: "exclusive",
              product_data: {
                name: `${numCrystals} Crystals`,
                description:
                  "Crystal is an universal currency for calling AI features in openroleplay.ai",
              },
            },
            quantity: 1,
          },
        ],
        ...(user?.email ? { customer_email: user?.email } : {}),
        mode: "payment",
        ui_mode: "embedded",
        return_url: `${domain}?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: { enabled: true },
      });

    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });
    return session.client_secret as string;
  },
});

export const subscribe = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (
    ctx: any,
    {
      userId,
    }: {
      userId: Id<"users">;
    },
  ): Promise<string> => {
    const domain: string =
      process.env.HOSTING_URL ?? "http://localhost:3000/shop";
    const stripe: Stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });
    const paymentId: string = await ctx.runMutation(internal.payments.create, {
      numCrystals: 200,
      productName: "ORP+",
      userId,
    });
    const user = await ctx.runQuery(internal.users.getUserInternal, {
      id: userId,
    });
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "USD",
              recurring: { interval: "month" },
              unit_amount_decimal: "999",
              tax_behavior: "exclusive",
              product_data: {
                name: `ORP+`,
                description:
                  "Double memory, Earn more crystals, Unlock exclusive features",
              },
            },
            quantity: 1,
          },
        ],
        ...(user?.email ? { customer_email: user?.email } : {}),
        mode: "subscription",
        ui_mode: "embedded",
        return_url: `${domain}?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: { enabled: true },
      });

    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });
    return session.client_secret as string;
  },
});

export const unsubscribe = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });
    try {
      const subscriptionId = (await ctx.runQuery(
        internal.payments.getSubscriptionId,
        {
          userId,
        },
      )) as string;
      console.log(`Subscription ID: ${subscriptionId}`);
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
          cancellation_details: {
            comment: "Customer canceled their subscription.",
          },
        },
      );
      const cancelsAtDate = new Date(
        updatedSubscription.current_period_end * 1000,
      )
        .toISOString()
        .split("T")[0];
      if (
        typeof updatedSubscription.id === "string" &&
        typeof cancelsAtDate === "string"
      ) {
        await ctx.runMutation(internal.payments.cancelSubscription, {
          subscriptionId: updatedSubscription.id,
          cancelsAt: cancelsAtDate,
        });
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const uncancel = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });
    try {
      // Retrieve the subscription to check if it's canceled or canceling
      const subscriptionId = (await ctx.runQuery(
        internal.payments.getSubscriptionId,
        {
          userId,
        },
      )) as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.cancel_at_period_end) {
        // Update subscription to remove cancel_at_period_end
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            cancel_at_period_end: false,
          },
        );
        // Log successful uncancel
        console.log(`Subscription ${subscriptionId} uncancelled successfully.`);
        await ctx.runMutation(internal.payments.cancelSubscription, {
          subscriptionId: updatedSubscription.id,
          cancelsAt: "",
        });
        return { success: true, subscriptionId: updatedSubscription.id };
      } else {
        // Subscription is not in a canceled or canceling state
        return {
          success: false,
          error: "Subscription is not canceled or in the process of canceling.",
        };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async ({ runMutation }, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2023-10-16",
    });
    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      console.log("event:::", event);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const stripeId = session?.id;
        if (session.mode === "payment") {
          await runMutation(internal.payments.fulfill, { stripeId });
        } else if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          await runMutation(internal.payments.fulfillSubscription, {
            stripeId,
            subscriptionId,
          });
        }
      } else if (event.type === "customer.subscription.updated") {
        const session = event.data.object;
        const subscriptionId = session?.id;
        await runMutation(internal.payments.updateSubscription, {
          subscriptionId,
        });
      } else if (event.type === "customer.subscription.deleted") {
        const session = event.data.object;
        const subscriptionId = session?.id;
        await runMutation(internal.payments.deleteSubscription, {
          subscriptionId,
        });
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
