import { Button } from "@/lib/ui/__shadcn__/button";
import { Wallet } from "lucide-react";
import { capitalizeFirstLetter, formatPriceCents } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/lib/ui/__shadcn__/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { CheckoutAPI } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/providers/ToastProvider";
import isDev from "@/lib/utils/isDev";

const emailSchema = z.object({ email: z.email() });

const PaymentConfirmation = () => {
  const payment = useCheckoutStore((s) => s.payment);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const session = useAuthStore((s) => s.session);
  const navi = useNavigate();

  const email = session?.user?.email ?? "";
  // TODO: prefer users name in DB after api for that is available
  const userName = session?.user?.user_metadata?.name ?? email?.split("@")[0];

  const pmTotal = payment?.total;
  const pmType = payment?.type;

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // const { mutate: createPendingCheckoutMutation, isPending } = useMutation({
  //   mutationFn: CheckoutAPI.createPendingCheckout,
  //   onError: (err) => {
  //     isDev && console.error(err.message);
  //     addToast("Payment failed. Please try again.", "error");
  //   },
  //   onSuccess: (data) => {
  //     queryClient.setQueryData(["pending-checkout", data.order.id], data);
  //   },
  // });

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email },
  });

  const emailInputVal = watch("email");

  useEffect(() => {
    console.log({ payment });
    if (!pmTotal || !pmType) navi(-1);
  }, [pmTotal]);

  const onSubmit = () => {
    // if (!total)
  };
  const handlePay = () => {
    // if (!total)
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
          className="fixed bottom-0 left-0 w-full z-50"
        >
          <div className=" py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
            <Button
              disabled={!isValid}
              type="submit"
              className="h-12 w-full rounded-xl md:w-44"
            >
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
