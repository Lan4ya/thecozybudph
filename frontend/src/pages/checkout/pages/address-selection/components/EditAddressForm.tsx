import { motion } from "framer-motion";
import { ChevronLeft, Hash, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  updateAddressFormSchema,
  type Address,
  type UpdateAddressInput,
} from "@TheCozyBud/schemas";
import isDev from "@/lib/utils/isDev";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddressAPI } from "@/api/address";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { checkoutAddressesQK } from "@/pages/checkout/hooks/useAddressQuery";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";

type EditAddressFormValues = z.infer<typeof updateAddressFormSchema>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

const EditAddressForm = ({
  onCloseForm,
  updatingAddress,
}: {
  onCloseForm: () => void;
  updatingAddress: Address;
}) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<EditAddressFormValues>({
    defaultValues: {
      ...updatingAddress,
      province: updatingAddress.province ?? undefined,
    },
    resolver: zodResolver(updateAddressFormSchema),
    mode: "onChange",
  });

  const isDefault = useWatch({ control, name: "isDefault" });
  const phoneNumber = watch("phoneNumber");
  const displayPhoneNumber = phoneNumber?.replace(/^\+63/, "") ?? "";

  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const setCheckoutAddress = useCheckoutStore((state) => state.setAddress);

  const { mutate: updateAddressMutation, isPending: updateLoading } =
    useMutation({
      mutationFn: ({
        address,
        addressId,
      }: {
        address: UpdateAddressInput;
        addressId: string;
      }) => AddressAPI.udpateAddress(address, addressId),
      onError: (err: Error) => {
        isDev && console.error(err.message);
        addToast("Something wen't wrong. Please try again later.", "error");
      },
      onSuccess: (newAddress) => {
        queryClient.setQueryData<Address[]>(
          [checkoutAddressesQK],
          (old = []) => {
            const next = [...old];
            const idx = old.findIndex((o) => o.id === newAddress.id);

            if (idx !== -1) {
              next[idx] = newAddress;
              return next;
            }
            return next;
          },
        );

        addToast("Saved address", "success");
        setCheckoutAddress(updatingAddress);
        onCloseForm();
      },
    });

  const toggleDefault = useCallback(() => {
    if (updatingAddress.isDefault) {
      addToast(
        "Cannot unset default address. Set another address as default instead.",
        "info",
      );
      return;
    }

    setValue("isDefault", !isDefault, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [isDefault, setValue]);

  const onSubmit = (address: EditAddressFormValues) => {
    // console.log("submit address payload", address);
    updateAddressMutation({ address, addressId: updatingAddress.id });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (err) => {
        isDev && console.log(err);
      })}
      noValidate
    >
      <div className="max-w-7xl px-4 pb-32 pt-6 custom-container">
        <div className="sticky top-0 z-20 mb-6 grid grid-cols-3 border-b border-border/40 bg-background/90 pb-3 pt-2 backdrop-blur">
          <Button
            type="button"
            onClick={onCloseForm}
            variant="minimal"
            size="auto"
            className="justify-self-start"
          >
            <ChevronLeft className="text-muted-foreground" />
          </Button>

          <h1 className="justify-self-center text-xl font-semibold text-foreground">
            Edit Address
          </h1>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Address
                </h2>
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Full name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <User className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("fullName")}
                    placeholder="Juan Dela Cruz"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Phone number
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <span className="border rounded-md text-xs -mr-2 mt-0.5 px] px-2">
                    +63
                  </span>
                  <input
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedValue = value ? `+63${value}` : "";
                      setValue("phoneNumber", formattedValue, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    value={displayPhoneNumber}
                    maxLength={10}
                    placeholder="9XXXXXXXXX"
                    inputMode="numeric"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.phoneNumber?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Postal code
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <Hash className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("postalCode")}
                    placeholder="1100"
                    inputMode="numeric"
                    maxLength={4}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.postalCode?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Region
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("region")}
                    placeholder="National Capital Region (NCR)"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.region?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Province
                  <span className="text-xs ml-1 text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("province")}
                    placeholder="Metro Manila"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.province?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  City
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("city")}
                    placeholder="Quezon City"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.city?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Barangay
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("barangay")}
                    placeholder="Bagumbayan"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.barangay?.message} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Address line
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm focus-within:border-primary/40">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    {...register("addressLine")}
                    placeholder="House / block / street / landmark"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldError message={errors.addressLine?.message} />
              </div>
            </div>
          </motion.section>

          {/* isDefault */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:sticky lg:top-20 lg:h-fit"
          >
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-foreground/90">
                Set as default address
              </div>

              <button
                type="button"
                onClick={toggleDefault}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40",
                  updatingAddress.isDefault && "opacity-60",
                )}
              >
                <div>
                  <div className="font-medium text-foreground">
                    Default address
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Use this for future checkouts
                  </div>
                </div>
                <div
                  className={[
                    "relative h-7 w-12 rounded-full p-1 transition-colors duration-300",
                    isDefault ? "bg-primary" : "bg-muted",
                  ].join(" ")}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-5 w-5 rounded-full bg-background shadow-md"
                    animate={{ x: isDefault ? 20 : 0 }}
                  />
                </div>
              </button>
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="hidden flex-1 text-sm text-muted-foreground md:block">
            Double-check the address before saving.
          </div>
          <Button
            type="submit"
            disabled={!isValid || updateLoading || !isDirty}
            className="h-12 flex-1 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:min-w-44"
          >
            {updateLoading && <Spinner />}Save address
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditAddressForm;
