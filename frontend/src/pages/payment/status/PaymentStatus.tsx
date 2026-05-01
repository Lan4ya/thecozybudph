import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { PaymentAPI } from "@/api/payment";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import type { GetPaymentStatusRes } from "@TheCozyBud/schemas";
import { CheckoutPaymentStatusSkeleton } from "@/lib/ui/skeletons/CheckoutPaymentStatusSkeleton";
import type { PaymentLoaderData } from "./PaymentStatusLoader";

type UiPaymentStatus = "pending" | "paid" | "failed";

const normalizeStatus = (s: GetPaymentStatusRes["status"]): UiPaymentStatus => {
  if (s === "paid" || s === "failed") return s;
  return "pending";
};

// @returns DD-MM-YYYY HH:MM
const formatOrderExpiresAt = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1,
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const PaymentStatus = () => {
  const { paymentId } = useLoaderData<PaymentLoaderData>();

  if (!paymentId) return null;

  return (
    <Suspense fallback={<CheckoutPaymentStatusSkeleton />}>
      <PaymentStatusInner id={paymentId} />
    </Suspense>
  );
};

const PaymentStatusInner = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const setCheckoutIds = useCheckoutStore((s) => s.setCheckoutIds);

  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["payment-status", id],
    queryFn: (): Promise<GetPaymentStatusRes> => PaymentAPI.getStatus(id),
    staleTime: 0,
  });

  const pmStatus: UiPaymentStatus = normalizeStatus(data?.status);

  useEffect(() => {
    if (!isFetching) {
      setPayment({ status: pmStatus });
      setCheckoutIds({ session: undefined });
    }
  }, [isFetching, pmStatus, setPayment, setCheckoutIds]);

  const orderExpiresAt = formatOrderExpiresAt(new Date(data.expiresAt));

  const ui: Record<
    UiPaymentStatus,
    {
      icon: React.ReactNode;
      bg: string;
      title: string;
      subtitle: string;
    }
  > = {
    pending: {
      icon: <Clock className="size-10 animate-pulse" />,
      bg: "bg-yellow-100 text-yellow-700",
      title: "Payment Pending",
      subtitle: `Please pay before ${orderExpiresAt}. Go to My Purchases for more info.`,
    },
    paid: {
      icon: <CheckCircle className="size-10" />,
      bg: "bg-green-100 text-green-600",
      title: "Payment Successful",
      subtitle: "Your order is confirmed. Go to My Purchases for more info.",
    },
    failed: {
      icon: <XCircle className="size-10" />,
      bg: "bg-red-100 text-red-600",
      title: "Payment Failed",
      subtitle:
        "We couldn’t process your payment. Please retry or choose another payment method. Go to My Purchases for more info.",
    },
  };

  const current = ui[pmStatus];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-border/50">
        <CardContent className="flex flex-col items-center text-center py-10 px-6 gap-6">
          <div className={`rounded-full p-4 ${current.bg}`}>{current.icon}</div>

          <h1 className="text-2xl font-semibold">{current.title}</h1>

          <p className="text-sm text-muted-foreground max-w-xs">
            {current.subtitle}
          </p>

          <div className="flex flex-col gap-3 w-full mt-4">
            <Button className="w-full" onClick={() => navigate("/shop")}>
              Back to Shop
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/profile/my-purchases")}
            >
              My Purchases
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatus;
