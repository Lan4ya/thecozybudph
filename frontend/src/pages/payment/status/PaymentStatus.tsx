import { CheckCircle, Clock } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "@/api/index";
import type { GetPaymentStatusRes } from "@cozybud/schemas";
import { PaymentStatusSkeleton } from "@/lib/ui/skeletons/CheckoutPaymentStatusSkeleton";
import type { PaymentLoaderData } from "./PaymentStatusLoader";
import { EmptyOrErrorState } from "@/components/EmptyOrErrorState";

// @returns DD-MM-YYYY HH:MM
const formatOrderExpiresAt = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1,
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const PaymentStatus = () => {
  const { paymentId } = useLoaderData<PaymentLoaderData>();
  return <PaymentStatusInner id={paymentId} />;
};

const PaymentStatusInner = ({ id }: { id: string }) => {
  const navigate = useNavigate();

  const { data, error, isFetching } = useQuery({
    queryKey: ["payment-status", id],
    queryFn: (): Promise<GetPaymentStatusRes> =>
      OrderAPI.getOrderPaymentStatus(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      // stop refetching after N updates
      if (query.state.dataUpdateCount > 5) {
        return false;
      }

      // refetch every 3sec if still pending
      return status === "pending" ? 3000 : false;
    },
  });

  if (isFetching && !data) {
    return <PaymentStatusSkeleton />;
  }

  if (error || !data) {
    if (error?.status === 404) {
      return (
        <EmptyOrErrorState
          title={"Payment not found"}
          description="We coudn't find the payment you're looking for."
        />
      );
    }
    throw error || new Error("Failed to load payment status");
  }

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
      subtitle: `Please pay before ${orderExpiresAt}. Go to "My Purchases" for more info.`,
    },
    paid: {
      icon: <CheckCircle className="size-10" />,
      bg: "bg-green-100 text-green-600",
      title: "Payment Successful",
      subtitle: 'Your order is confirmed. Go to "My Purchases" for more info.',
    },
  };

  const current = ui[data.status];

  return (
    <div className="h-dvh flex items-center justify-center px- ">
      <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center text-center px-6 gap-6">
        <div className={`rounded-full p-4 ${current.bg}`}>{current.icon}</div>

        <h1 className="text-2xl font-semibold">{current.title}</h1>

        <p className="text-sm text-muted-foreground max-w-xs">
          {current.subtitle}
        </p>

        <div className="flex flex-col gap-3 w-full mt-4">
          <Button
            className="w-full"
            onClick={() =>
              navigate(
                `/profile/my-purchases?status=${data.status === "paid" ? "toShip" : "toPay"}`,
              )
            }
          >
            My Purchases
          </Button>

          <Button
            variant={"outline"}
            className="w-full"
            onClick={() => navigate("/shop")}
          >
            Back to Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
