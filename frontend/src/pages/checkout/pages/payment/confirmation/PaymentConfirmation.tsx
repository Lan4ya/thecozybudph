import { Button } from "@/lib/ui/__shadcn__/button";
import { Wallet } from "lucide-react";
import { capitalizeFirstLetter, formatPriceCents } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useLoaderData, useNavigate } from "react-router";
import { Input } from "@/lib/ui/__shadcn__/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { CheckoutAPI } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/providers/ToastProvider";
import isDev from "@/lib/utils/isDev";
import {
  payOrderSchema,
  type PayOrderInput,
  type PayOrderRes,
} from "@TheCozyBud/schemas";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import type { PaymentConfirmationLoaderData } from "./PaymentConfirmationLoader";
import { useEffect, useRef } from "react";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

// NOTE: Maybe make this a global comp along with PaymentStatus.tsx so 'My Purchases' page can reuse this.

const emailSchema = z.object({ email: z.email() });

const PaymentConfirmation = () => {
  const { sessionId, orderId } = useLoaderData<PaymentConfirmationLoaderData>();

  const session = useAuthStore((s) => s.session);

  const payment = useCheckoutStore((s) => s.payment);

  const navi = useNavigate();

  const userEmail = session?.user?.email ?? "";
  // TODO: prefer users name in DB after api for that is available
  const userName =
    session?.user?.user_metadata?.name ?? userEmail?.split("@")[0];

  const pmTotal = payment?.total ?? 0;
  const pmType = payment?.type;

  const { addToast } = useToast();

  const { mutate: payOrderMutation, isPending: confirmOrderPending } =
    useMutation({
      mutationFn: ({
        orderId,
        payload,
        idempotencyKey,
      }: {
        orderId: string;
        payload: PayOrderInput;
        idempotencyKey: string;
      }): Promise<PayOrderRes> =>
        CheckoutAPI.payOrder(orderId, payload, idempotencyKey),
      onError: (err) => {
        isDev && console.error(err.message);
        addToast("Payment failed. Please try again.", "error");
      },
      onSuccess: (data: PayOrderRes) => {
        useCheckoutStore.getState().setPayment({ status: "pending" });

        if (data.paymentUrl) {
          if (data.paymentUrl.startsWith("http")) {
            window.location.href = data.paymentUrl;
          } else {
            navi(data.paymentUrl);
          }
        }
      },
    });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: userEmail },
  });

  useEffect(() => {
    if (userEmail) {
      setValue("email", userEmail, { shouldValidate: true });
    }
  }, [userEmail]);

  const paymentIdempotencyKeyRef = useRef<string | null>(null);

  const onSubmit: SubmitHandler<{ email: string }> = (data) => {
    const { email } = data;
    const paymentId = useCheckoutStore.getState().checkoutIds?.payment!;

    const payload = {
      paymentId,
      billing: {
        name: userName,
        email,
      },
      type: pmType!,
      checkoutSessionId: sessionId,
    } satisfies PayOrderInput;

    // validation
    const result = payOrderSchema.safeParse(payload);

    if (!result.success) {
      isDev && console.error(z.flattenError(result.error).fieldErrors);
      addToast("Something wen't wrong. please try again", "error");
      return;
    }

    // Reuse the same key for retries of the same submit intent.
    const idempotencyKey =
      paymentIdempotencyKeyRef.current ?? crypto.randomUUID();
    paymentIdempotencyKeyRef.current = idempotencyKey;
    payOrderMutation({ orderId, payload: result.data, idempotencyKey });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="pb-32 pt-6 custom-container mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 mb-6 border-b border-border/40 bg-background/90 pb-3 pt-2 shadow-b-sm backdrop-blur"
        >
          <h1 className="justify-self-center text-center text-xl font-semibold text-foreground">
            Payment Confirmation
          </h1>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          <div className="flex border-b border-border/40 py-4 px-2 justify-between">
            <span>Total Payment</span>
            <span className="text-primary font-semibold">
              {formatPriceCents(pmTotal)}
            </span>
          </div>

          <div className="flex border-b border-border/40 py-4 px-2 justify-between">
            <span>Payment Method</span>
            <span>{capitalizeFirstLetter(pmType ?? "")}</span>
          </div>

          <div className="flex flex-col gap-2 border-b border-border/40 py-4 px-2">
            <label>Email</label>
            <Input {...register("email")} />
          </div>
        </motion.main>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 left-0 w-full z-50 md:static md:w-auto"
        >
          <div className="py-4 px-6 md:px-0 flex items-center justify-between max-w-7xl mx-auto">
            <Button
              disabled={!isValid || confirmOrderPending}
              type="submit"
              className="h-12 w-full rounded-xl md:w-36 md:ml-auto"
            >
              {confirmOrderPending && <Spinner />}
              <Wallet />
              Pay
            </Button>
          </div>
        </motion.div>
      </div>
    </form>
  );
};

export default PaymentConfirmation;
