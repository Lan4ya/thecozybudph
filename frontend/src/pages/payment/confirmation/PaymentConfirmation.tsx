import { Button } from "@/lib/ui/__shadcn__/button";
import { Wallet } from "lucide-react";
import { capitalizeFirstLetter, formatPriceCents } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useBlocker,
} from "react-router";
import { Input } from "@/lib/ui/__shadcn__/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { OrderAPI } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/providers/ToastProvider";
import isDev from "@/lib/utils/isDev";
import {
  payOrderSchema,
  type PayOrderInput,
  type PayOrderRes,
} from "@cozybud/schemas";
import type { PaymentConfirmationLoaderData } from "./PaymentConfirmationLoader";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { EmptyOrErrorState } from "@/components/EmptyOrErrorState";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";

const emailSchema = z.object({ email: z.email() });

interface LocationState {
  orderId?: string;
  willPay?: boolean;
}

const PaymentConfirmation = () => {
  const { paymentId } = useLoaderData<PaymentConfirmationLoaderData>();

  const locState = (useLocation().state as LocationState) || {};
  const orderIdFromState = locState.orderId;

  const session = useAuthStore((s) => s.session);
  const payment = useCheckoutStore((s) => s.payment);
  const willPay = usePaymentStore((s) => s.willPay);
  const setWIllPay = usePaymentStore((s) => s.setWillPay);

  const navi = useNavigate();

  const getPaymentStatusQK = ["payment-status", paymentId];

  const {
    data: paymentData,
    error: paymentError,
    isLoading: isPaymentLoading,
  } = useQuery({
    queryKey: getPaymentStatusQK,
    queryFn: async () => {
      return await OrderAPI.getOrderPaymentStatus(paymentId!);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!paymentId,
  });

  const orderId = orderIdFromState || paymentData?.orderId;

  const isRedirectingRef = useRef(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Block navigation away if willPay is true (user came from either checkout page and clicked 'order' btn
  // or my purchases page and clicked 'pay now' btn on pending order) unless we are intentionally redirecting (payment
  // gateway)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      willPay &&
      !isRedirectingRef.current,
  );

  // Show the confirmation dialog when the blocker is triggered
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeaveDialog(true);
    }
  }, [blocker.state]);

  const handleLeaveConfirm = () => {
    setShowLeaveDialog(false);
    blocker.proceed?.(); // allow navigation
  };

  const handleLeaveCancel = () => {
    setShowLeaveDialog(false);
    blocker.reset?.(); // stay on the page
  };

  useLayoutEffect(() => {
    if (!orderId && !willPay) navi("/", { replace: true });

    if (isPaymentLoading || !paymentData || isRedirectingRef.current) return;

    if (paymentData.status === "pending" && willPay === false) {
      navi(`/payment/${paymentId}/status`, { replace: true });
    }
  }, [orderId, isPaymentLoading, paymentId, paymentData, navi, willPay]);

  const userEmail = session?.user?.email ?? "";
  const userName =
    session?.user?.user_metadata?.name ?? userEmail?.split("@")[0];

  const pmTotal = payment?.total ?? 0;
  const pmType = payment?.type;

  const { addToast } = useToast();

  const { mutate: payOrderMutation, isPending: payOrderPending } = useMutation({
    mutationFn: ({
      orderId,
      payload,
      idempotencyKey,
    }: {
      orderId: string;
      payload: PayOrderInput;
      idempotencyKey: string;
    }): Promise<PayOrderRes> =>
      OrderAPI.payOrder(orderId, payload, idempotencyKey),
    onError: () => addToast("error"),
    onSuccess: (data: PayOrderRes) => {
      isRedirectingRef.current = true;
      setWIllPay(false);

      if (data.paymentUrl) {
        if (data.paymentUrl.startsWith("http")) {
          window.location.replace(data.paymentUrl);
          window.location.href = data.paymentUrl;
        } else {
          navi(data.paymentUrl, { replace: true });
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
  }, [userEmail, setValue]);

  const paymentIdempotencyKeyRef = useRef<string | null>(null);

  const onSubmit: SubmitHandler<{ email: string }> = useCallback(
    (data) => {
      if (!orderId) {
        addToast(
          "Order information is missing. Please refresh the page.",
          "error",
        );
        return;
      }

      const { email } = data;

      const payload = {
        paymentId,
        billing: {
          name: userName,
          email,
        },
        type: pmType!,
      };

      const result = payOrderSchema.safeParse(payload);
      if (!result.success) {
        isDev && console.error(z.flattenError(result.error).fieldErrors);
        addToast("Something went wrong. please try again", "error");
        return;
      }

      const idempotencyKey =
        paymentIdempotencyKeyRef.current ?? crypto.randomUUID();
      paymentIdempotencyKeyRef.current = idempotencyKey;

      payOrderMutation({ orderId, payload: result.data, idempotencyKey });
    },
    [userName, pmType, orderId, paymentId, payOrderMutation, addToast],
  );

  if (paymentError) {
    if (paymentError.status === 404) {
      return (
        <EmptyOrErrorState
          title="Order not found"
          description="We coudn't find the order you're looking for"
        />
      );
    }
    throw paymentError;
  }

  if (!paymentData) return null;

  return (
    <>
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
            className="text-muted-foreground md:pt-12 "
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
            transition={{ delay: 0.1 }}
            className="fixed bottom-0 left-0 w-full z-50 md:static md:w-auto"
          >
            <div className="py-4 px-6 md:px-0 flex items-center justify-between max-w-7xl mx-auto">
              <Button
                disabled={!isValid || payOrderPending}
                type="submit"
                className="h-10 w-full rounded-xl md:w-28 md:ml-auto"
              >
                {payOrderPending && <Spinner />}
                <Wallet />
                Pay
              </Button>
            </div>
          </motion.div>
        </div>
      </form>

      {/* Leave confirmation dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Leave without paying?</DialogTitle>
            <DialogDescription>
              Your payment is still in progress. If you leave now, your order
              may not be completed. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleLeaveCancel}>
              Stay on this page
            </Button>
            <Button variant="destructive" onClick={handleLeaveConfirm}>
              Leave anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentConfirmation;
