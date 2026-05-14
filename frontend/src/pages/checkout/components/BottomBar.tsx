import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { useIsFetching, useMutation } from "@tanstack/react-query";
import { CheckoutAPI } from "@/api";
import {
  createOrderSchema,
  type CreateOrderInput,
  type CreateOrderRes,
} from "@TheCozyBud/schemas";
import { useToast } from "@/providers/ToastProvider";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { useShallow } from "zustand/react/shallow";
import isDev from "@/lib/utils/isDev";
import { z } from "zod";
import { createShippingQuoteQK } from "./ShippingSection";
import { useRef } from "react";

const BottomBar = () => {
  const navigate = useNavigate();
  const {
    shippingQuoteId,
    serviceType,
    total,
    checkoutIds,
    setCheckoutIds,
    source,
    address,
    orderItemsUI,
    paymentMethodType,
  } = useCheckoutStore(
    useShallow((s) => ({
      total: s.payment?.total,
      checkoutIds: s.checkoutIds,
      setCheckoutIds: s.setCheckoutIds,
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
        const key =
          orderIdempotencyKeyRef.current ?? crypto.randomUUID();
        orderIdempotencyKeyRef.current = key;
        return CheckoutAPI.createOrder(payload, key);
      },
      onError: () => {
        addToast("Something wen't wrong. please try again", "error");
      },
      onSuccess: (data) => {
        orderIdempotencyKeyRef.current = null;
        setCheckoutIds({ order: data.orderId, payment: data.paymentId });
        useCheckoutStore.getState().setPayment({ status: "verification" });
        navigate(`/checkout/${checkoutIds?.session}/order/${data.orderId}/pay`);
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
      addToast("Something wen't wrong. please try again", "error");
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
      className="fixed bottom-0 left-0 w-full bg-card border-t border-border/40  z-50"
    >
      <div className=" py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="text-primary ml-2 font-bold">
            {total && formatPriceCents(total)}
          </span>
        </div>
        <Button
          disabled={
            !address?.id ||
            pendingCreateOrder ||
            !shippingQuoteId ||
            isFetchingShippingQuote
          }
          onClick={handlePreOrder}
          className="px-8 font-semibold"
        >
          {pendingCreateOrder && <Spinner />} Pre-order
        </Button>
      </div>
    </motion.div>
  );
};

export default BottomBar;
