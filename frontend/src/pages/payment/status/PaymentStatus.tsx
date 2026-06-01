import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { OrderAPI } from "@/api/index";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import type { GetPaymentStatusRes } from "@cozybud/schemas";
import { CheckoutPaymentStatusSkeleton } from "@/lib/ui/skeletons/CheckoutPaymentStatusSkeleton";
import type { PaymentLoaderData } from "./PaymentStatusLoader";

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

  // Using local state instead of TanStack's query.state.dataUpdateCount so the
  // 10-refetch limit resets on every component mount rather than persisting in cache.
  const [refetchCount, setRefetchCount] = useState<number>(0);

  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["payment-status", id],
    queryFn: (): Promise<GetPaymentStatusRes> =>
      OrderAPI.getOrderPaymentStatus(id),
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      // Stop completely if it has refetched 10 times
      if (refetchCount >= 10) {
        return false;
      }

      if (status === "pending") {
        setRefetchCount((prev) => prev + 1);
        return 5000; // refetch every 5 seconds
      }

      return false;
    },
  });

  useEffect(() => {
    if (!isFetching) {
      setPayment({ status: data.status });
      setCheckoutIds({ session: undefined });
    }
  }, [isFetching, data.status, setPayment, setCheckoutIds]);

  const orderExpiresAt = formatOrderExpiresAt(new Date(data.expiresAt));

  const ui: Record<
    typeof data.status,
    {
      icon: React.ReactNode;
      bg: string;
      title: string;
      subtitle: string;
      note?: string;
    }
  > = {
    pending: {
      icon: <Clock className="size-10 animate-pulse" />,
      bg: "bg-yellow-100 text-yellow-700",
      title: "Payment Pending",
      subtitle: `Please pay before ${orderExpiresAt}. Go to My Purchases for more info.`,
      note: "Still pending? Please refresh the page or check back later for updates.",
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

  const current = ui[data.status];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-border/50">
        <CardContent className="flex flex-col items-center text-center py-10 px-6 gap-6">
          <div className={`rounded-full p-4 ${current.bg}`}>{current.icon}</div>

          <h1 className="text-2xl font-semibold">{current.title}</h1>

          <p className="text-sm text-muted-foreground max-w-xs">
            {current.subtitle}
          </p>

          {current.note && (
            <p className="text-sm text-muted-foreground/60 max-w-xs">
              {current.note}
            </p>
          )}

          <div className="flex flex-col gap-3 w-full mt-4">
            <Button className="w-full" onClick={() => navigate("/shop")}>
              Back to Shop
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                navigate(
                  `/profile/my-purchases?status=${data.status === "paid" ? "toShip" : "toPay"}`,
                )
              }
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
