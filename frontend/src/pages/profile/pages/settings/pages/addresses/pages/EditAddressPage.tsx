import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  updateAddressFormSchema,
  type Address,
  type UpdateAddressInput,
} from "@cozybud/schemas";
import isDev from "@/lib/utils/isDev";
import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddressAPI } from "@/api/address";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import {
  checkoutAddressesQK,
  checkoutDefaultAddressQK,
  useAddressesQuery,
} from "@/pages/checkout/hooks/useAddressQuery";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import { useNavigate, useParams } from "react-router";
import { Input } from "@/lib/ui/__shadcn__/input";

type EditAddressFormValues = z.infer<typeof updateAddressFormSchema>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

export default function EditAddressPage() {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const { data: addresses, isFetching: loadingAddresses } = useAddressesQuery();
  const updatingAddress = addresses?.find((a) => a.id === addressId);

  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<EditAddressFormValues>({
    resolver: zodResolver(updateAddressFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (updatingAddress) {
      reset({
        fullName: updatingAddress.fullName,
        phoneNumber: updatingAddress.phoneNumber,
        postalCode: updatingAddress.postalCode,
        region: updatingAddress.region,
        city: updatingAddress.city,
        province: updatingAddress.province ?? "",
        barangay: updatingAddress.barangay,
        addressLine: updatingAddress.addressLine,
        isDefault: updatingAddress.isDefault,
      });
    }
  }, [updatingAddress, reset]);

  const [isDefault, phoneNumber] = useWatch({
    control,
    name: ["isDefault", "phoneNumber"],
  });
  const displayPhoneNumber = phoneNumber?.replace(/^\+63/, "") ?? "";

  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const setAddress = useCheckoutStore((state) => state.setAddress);

  const { mutate: updateAddressMutation, isPending: updateLoading } =
    useMutation({
      mutationFn: ({
        address,
        addressId,
      }: {
        address: UpdateAddressInput;
        addressId: string;
      }) => AddressAPI.updateAddress(address, addressId),
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
        setAddress(newAddress);
        queryClient.invalidateQueries({ queryKey: [checkoutDefaultAddressQK] });
        navigate("/profile/settings/account");
      },
    });

  const toggleDefault = useCallback(() => {
    if (updatingAddress?.isDefault) {
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
  }, [isDefault, setValue, addToast, updatingAddress?.isDefault]);

  const onSubmit = (address: EditAddressFormValues) => {
    if (!addressId) return;
    updateAddressMutation({ address, addressId });
  };

  if (loadingAddresses) return <Spinner />;
  if (!updatingAddress) return <div>Address not found</div>;

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold">Edit Address</h3>

          <form
            onSubmit={handleSubmit(onSubmit, (err) => {
              if (isDev) {
                console.log(err);
                addToast(JSON.stringify(err), "error");
              }
            })}
            className="space-y-6"
            noValidate
          >
            <div className="grid gap-6">
              <section className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Note: We deliver to North, Central, South Luzon, and Cebu
                    Islandwide only. See Lalamove's{" "}
                    <a
                      href="https://www.lalamove.com/en-ph/serviceable-areas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      serviceable areas
                    </a>
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium">
                      Full name
                    </label>
                    <Input
                      {...register("fullName")}
                      placeholder="Juan Dela Cruz"
                    />
                    <FieldError message={errors.fullName?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Phone number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r pr-2">
                        +63
                      </span>
                      <Input
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
                        className="pl-14"
                      />
                    </div>
                    <FieldError message={errors.phoneNumber?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Postal code
                    </label>
                    <Input
                      {...register("postalCode")}
                      placeholder="1100"
                      inputMode="numeric"
                      maxLength={4}
                    />
                    <FieldError message={errors.postalCode?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Region</label>
                    <Input {...register("region")} placeholder="NCR" />
                    <FieldError message={errors.region?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Province
                    </label>
                    <Input
                      {...register("province")}
                      placeholder="Metro Manila"
                    />
                    <FieldError message={errors.province?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">City</label>
                    <Input {...register("city")} placeholder="Quezon City" />
                    <FieldError message={errors.city?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Barangay
                    </label>
                    <Input {...register("barangay")} placeholder="Bagumbayan" />
                    <FieldError message={errors.barangay?.message} />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-sm font-medium">
                      Address line
                    </label>
                    <Input
                      {...register("addressLine")}
                      placeholder="House / block / street / landmark"
                    />
                    <FieldError message={errors.addressLine?.message} />
                  </div>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="font-medium text-sm">Default address</div>
                <button
                  type="button"
                  onClick={toggleDefault}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40",
                    updatingAddress.isDefault && "opacity-60",
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    Use this for future checkouts
                  </div>
                  <div
                    className={[
                      "relative h-6 w-10 rounded-full p-1 transition-colors duration-300",
                      isDefault ? "bg-primary" : "bg-muted",
                    ].join(" ")}
                  >
                    <motion.div
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="h-4 w-4 rounded-full bg-background shadow-md"
                      animate={{ x: isDefault ? 16 : 0 }}
                    />
                  </div>
                </button>
              </aside>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile/settings/account")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || updateLoading || !isDirty}
                className="min-w-40"
              >
                {updateLoading && <Spinner />} Save address
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
