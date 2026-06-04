import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { useIsFetching, useMutation } from "@tanstack/react-query";
import { OrderAPI } from "@/api";
import {
  createOrderSchema,
  type CreateOrderInput,
  type CreateOrderRes,
} from "@cozybud/schemas";
import { useToast } from "@/providers/ToastProvider";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { useShallow } from "zustand/react/shallow";
import isDev from "@/lib/utils/isDev";
import { z } from "zod";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { createShippingQuoteQK } from "./ShippingSection";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { usePaymentStore } from "@/store/usePaymentStore";

const BottomBar = () => {
  const navigate = useNavigate();
  const {
    shippingQuoteId,
    serviceType,
    total,
    source,
    address,
    orderItemsUI,
    paymentMethodType,
  } = useCheckoutStore(
    useShallow((s) => ({
      total: s.payment?.total,
      source: s.source,
      address: s.address,
      orderItemsUI: s.orderItemsUI,
      shippingQuoteId: s.shipping?.quotationId,
      serviceType: s.shipping?.serviceType,
      paymentMethodType: s.payment?.type,
      setPayment: s.setPayment,
    })),
  );

  const { addToast } = useToast();
  const orderIdempotencyKeyRef = useRef<string | null>(null);

  const isFetchingShippingQuote =
    useIsFetching({
      queryKey: createShippingQuoteQK(address),
    }) > 0;

  const { mutate: createOrderMutation, isPending: pendingCreateOrder } =
    useMutation({
      mutationFn: (payload: CreateOrderInput): Promise<CreateOrderRes> => {
        // Reuse the same key for retries of the same submit intent.
        const key = orderIdempotencyKeyRef.current ?? crypto.randomUUID();
        orderIdempotencyKeyRef.current = key;
        return OrderAPI.createOrder(payload, key);
      },
      onError: () => {
        addToast("Something went wrong. Please try again.", "error");
      },
      onSuccess: (data) => {
        orderIdempotencyKeyRef.current = null;
        // set to 'completed' since atp checkout lifecycle is done and we will now move on to payment status lifecycle
        // We save paymentId so we redirect the user to payment status page if the tries to go back to checkout page while already ordered
        useCheckoutStore
          .getState()
          .setCheckout({ status: "completed", paymentId: data.paymentId });

        navigate(`/payment/${data.paymentId}/confirm`, {
          state: { orderId: data.orderId },
        });
        usePaymentStore.getState().setWillPay(true);
      },
    });

  const orderItems = orderItemsUI.map((o) => ({
    productId: o.productId,
    variantId: o.variantId,
    quantity: o.quantity,
    cardMessages: o.cardMessages,
    primaryImageUrl: o.imageUrl,
  }));

  const handlePreOrder = () => {
    if (!address?.id) {
      addToast("Create an address first to make an order", "error");
      return;
    }

    const payload = {
      source,
      items: orderItems,
      addressId: address?.id,
      shippingQuoteId,
      paymentMethodType,
      serviceType,
    };

    // validation
    const result = createOrderSchema.safeParse(payload);

    if (!result.success) {
      addToast("Something went wrong. Please try again.", "error");
      if (isDev) {
        console.error(z.flattenError(result.error).fieldErrors);
      }
      return;
    }

    createOrderMutation(result.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 w-full bg-card border-t border-border/40 z-50"
    >
      <div className=" py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-sm">
          {address?.id ? (
            <>
              <span className="text-muted-foreground">Total:</span>
              <span className="text-primary ml-2 font-bold">
                {total && formatPriceCents(total)}
              </span>
            </>
          ) : (
            <span className="text-xs text-yellow-500">
              Create an address first to make an order
            </span>
          )}
        </div>

        {/* CTA */}
        <Button
          disabled={pendingCreateOrder || isFetchingShippingQuote}
          onClick={handlePreOrder}
          variant="secondary"
          className={cn(
            "px-8 font-semibold",
            (!shippingQuoteId || !address?.id) &&
              "opacity-50 cursor-not-allowed",
          )}
        >
          {pendingCreateOrder && <Spinner />}
          Order
        </Button>
      </div>
    </motion.div>
  );
};

export default BottomBar;
