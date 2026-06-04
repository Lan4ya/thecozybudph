import { AddressAPI } from "@/api";
import type { AppError } from "@/api/_error";
import { RouteLoaderFlowerSpinner } from "@/components/RouteLoaderSpinner";
import { useAddressesQuery, addressesQK } from "@/hooks/useAddressQuery";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { cn } from "@/lib/utils/cn";
import isDev from "@/lib/utils/isDev";
import { useToast } from "@/providers/ToastProvider";
import {
  updateAddressFormSchema,
  type AddressData,
  type UpdateAddressInput,
} from "@cozybud/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { z } from "zod";
import { FieldError } from "../../components/FieldError";

interface EditAddressFormProps {
  onSuccessSideEffect?: (newAddress: AddressData) => void;
  onGoBack: () => void;
}

type EditAddressFormValues = z.infer<typeof updateAddressFormSchema>;

export const EditAddressForm = ({
  onGoBack,
  onSuccessSideEffect,
}: EditAddressFormProps) => {
  const { addressId } = useParams<{ addressId: string }>();
  const { data: addresses = [], isLoading: loadingAddresses } =
    useAddressesQuery();
  const updatingAddress = addresses?.find((a) => a.id === addressId);

  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<EditAddressFormValues>({
    defaultValues: updatingAddress
      ? {
          fullName: updatingAddress.fullName,
          phoneNumber: updatingAddress.phoneNumber,
          postalCode: updatingAddress.postalCode,
          region: updatingAddress.region,
          city: updatingAddress.city,
          province: updatingAddress.province ?? "",
          barangay: updatingAddress.barangay,
          addressLine: updatingAddress.addressLine,
          isDefault: updatingAddress.isDefault,
        }
      : undefined,
    resolver: zodResolver(updateAddressFormSchema),
    mode: "onChange",
  });

  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navi = useNavigate();

  const [isDefault, phoneNumber] = useWatch({
    control,
    name: ["isDefault", "phoneNumber"],
  });
  const displayPhoneNumber = phoneNumber?.replace(/^\+63/, "") ?? "";

  const { mutate: updateAddressMutation, isPending: updateLoading } =
    useMutation({
      mutationFn: ({
        address,
        addressId,
      }: {
        address: UpdateAddressInput;
        addressId: string;
      }) => AddressAPI.updateAddress(address, addressId),
      onError: (err: AppError) => {
        isDev && console.error(err.message);
        if (
          err.status === 404 &&
          err.message === "No geocoding results found"
        ) {
          addToast(
            "We couldn't find this address on the map. Please double-check your address details",
            "error",
          );
          return;
        }
        addToast("Something went wrong. Please try again later.", "error");
      },
      onSuccess: (newAddress) => {
        queryClient.setQueryData<AddressData[]>([addressesQK], (old = []) => {
          return old.map((address) => {
            // If it's the updated address, return the fresh data
            if (address.id === newAddress.id) {
              return newAddress;
            }

            // If the new address is set to default, turn off default for everything else
            if (newAddress.isDefault && address.isDefault) {
              return { ...address, isDefault: false };
            }

            // Return untouched addresses as-is
            return address;
          });
        });

        addToast("Saved address", "success");

        if (onSuccessSideEffect) {
          // Execute flow-specific side effects
          onSuccessSideEffect(newAddress);
        }
      },
    });

  const toggleDefault = useCallback(() => {
    if (updatingAddress?.isDefault) {
      addToast(
        "Cannot unset default address. Set another address as default instead.",
        "error",
      );
      return;
    }

    setValue("isDefault", !isDefault, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [isDefault, setValue, addToast, updatingAddress?.isDefault]);

  const onSubmit = (address: EditAddressFormValues) => {
    if (!updatingAddress?.id) return;
    isDev && console.log("submit address payload", address);
    updateAddressMutation({ address, addressId: updatingAddress.id });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value ? `+63${value}` : "";

    setValue("phoneNumber", formattedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  if (loadingAddresses) {
    return <RouteLoaderFlowerSpinner />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (err) => {
        if (isDev) {
          console.log(err);
          addToast(JSON.stringify(err), "error");
        }
      })}
      noValidate
    >
      <div className="max-w-7xl space-y-12 lg:space-y-24 pb-32 pt-6 custom-container">
        <div className="text-header flex-center border-b border-border/40 pb-3 pt-2 backdrop-blur">
          <h1>Edit Address</h1>
        </div>

        <div className="mb-10 flex gap-2  max-w-140">
          <div className="h-auto w-2 bg-yellow-500" />
          <p className="text-sm text-muted-foreground">
            NOTE: As we use Lalamove's services, we only currently deliver to
            North, Central, South Luzon, and Cebu Islandwide. See Lalamove's{" "}
            <a
              href="https://www.lalamove.com/en-ph/serviceable-areas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              serviceable areas{" "}
            </a>
            for more info.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-border/60 bg-card py-6 px-4 shadow-sm sm:p-6"
          >
            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Full name
                </label>
                <Input {...register("fullName")} placeholder="Juan Dela Cruz" />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Phone number
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r pr-2">
                    +63
                  </span>
                  <Input
                    onChange={handlePhoneChange}
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
                <label className="block text-sm font-medium text-foreground/90">
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
                <label className="block text-sm font-medium text-foreground/90">
                  Region
                </label>
                <Input
                  {...register("region")}
                  placeholder="National Capital Region (NCR)"
                />
                <FieldError message={errors.region?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Province
                  <span className="text-xs ml-1 text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input {...register("province")} placeholder="Metro Manila" />
                <FieldError message={errors.province?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  City
                </label>
                <Input {...register("city")} placeholder="Quezon City" />
                <FieldError message={errors.city?.message} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Barangay
                </label>
                <Input {...register("barangay")} placeholder="Bagumbayan" />
                <FieldError message={errors.barangay?.message} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/90">
                  Address line
                </label>
                <Input
                  {...register("addressLine")}
                  placeholder="House / block / street / landmark"
                />
                <FieldError message={errors.addressLine?.message} />
              </div>
            </div>
          </motion.section>

          {/* isDefault */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mt-4"
          >
            <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:sticky lg:top-20 lg:h-fit">
              <div className="mb-2 text-sm font-medium text-foreground/90">
                Set as default address
              </div>

              <button
                type="button"
                onClick={toggleDefault}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40",
                  updatingAddress?.isDefault && "opacity-60",
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

            {/*  CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 border-t border-border/60 bg-background/90 p-4 backdrop-blur md:px-6 lg:static lg:justify-end lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-none">
              <Button
                className="h-10 flex-1 rounded-2xl lg:w-34 lg:flex-none lg:rounded-xl"
                variant="destructive"
              >
                Delete
              </Button>

              <Button
                type="submit"
                disabled={!isValid || updateLoading || !isDirty}
                className="h-10 flex-1 rounded-2xl lg:w-34 lg:flex-none lg:rounded-xl"
                variant="secondary"
              >
                {updateLoading && <Spinner />} Save
              </Button>
            </div>
          </motion.aside>
        </div>
      </div>
    </form>
  );
};
