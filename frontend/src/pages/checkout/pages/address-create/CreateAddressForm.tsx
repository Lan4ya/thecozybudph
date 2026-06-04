import { useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createAddressFormSchema,
  type AddressData,
  type CreateAddressInput,
} from "@cozybud/schemas";
import { useCallback } from "react";
import { useToast } from "@/providers/ToastProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddressAPI } from "@/api/address";
import isDev from "@/lib/utils/isDev";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { addressesQK } from "@/hooks/useAddressQuery";
import { FieldError } from "@/pages/checkout/components/FieldError";
import type { AppError } from "@/api/_error";

type FormValues = z.infer<typeof createAddressFormSchema>;

// const defaultValues = {
//   fullName: "",
//   phoneNumber: "",
//   postalCode: "",
//   region: "",
//   province: "",
//   city: "",
//   barangay: "",
//   addressLine: "",
//   isDefault: false,
// };

const defaultValues = {
  fullName: "",
  phoneNumber: "",
  postalCode: "4109",
  region: "Calabarzon (Region IV-A)",
  province: "Cavite",
  city: "Trece Martires City",
  barangay: "San Agustin",
  addressLine:
    "Ground Floor, Government Center Building, Cavite Provincial Capitol",
  isDefault: false,
};

interface CreateAddressFormProps {
  onSuccessSideEffect?: (newAddress: AddressData) => void;
}

const CreateAddressForm = ({ onSuccessSideEffect }: CreateAddressFormProps) => {
  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(createAddressFormSchema),
    mode: "onChange",
  });

  const isDefault = useWatch({ control, name: "isDefault" });

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createAddressMutation, isPending: createLoading } =
    useMutation({
      mutationFn: ({ address }: { address: CreateAddressInput }) =>
        AddressAPI.createAddress(address),
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
          return [newAddress, ...old];
        });

        addToast("Address created", "success");
        if (onSuccessSideEffect) {
          onSuccessSideEffect(newAddress);
        }
      },
    });

  const toggleDefault = useCallback(() => {
    setValue("isDefault", !isDefault, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [isDefault, setValue]);

  const onSubmit = (address: FormValues) => {
    createAddressMutation({ address });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="" noValidate>
      <div className="max-w-7xl space-y-12 lg:space-y-24 pb-32 pt-6 custom-container">
        <div className="text-header flex-center border-b border-border/40 pb-3 pt-2 backdrop-blur">
          <h1>Create Address</h1>
        </div>

        <div className="mb-10 flex gap-2  max-w-140">
          <div className="h-auto w-2 bg-yellow-500" />
          <p className="text-sm text-muted-foreground">
            Note: As we use Lalamove's services, we only currently deliver to
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
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/90">
                    Full name
                  </label>
                  <Input
                    {...register("fullName")}
                    placeholder="Juan Dela Cruz"
                  />
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
                      {...register("phoneNumber", {
                        setValueAs: (value: string) => {
                          if (!value) return "";
                          return `+63${value}`;
                        },
                      })}
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
                  <Input {...register("region")} placeholder="NCR" />
                  <FieldError message={errors.region?.message} />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/90">
                    Province{" "}
                    <span className="text-xs ml-1 text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <Input {...register("province")} placeholder="Sampaloc" />
                  <FieldError message={errors.province?.message} />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/90">
                    City
                  </label>
                  <Input {...register("city")} placeholder="Manila" />
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
                className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40"
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

            {/* CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 border-t border-border/60 bg-background/90 p-4 backdrop-blur md:px-6 lg:static lg:justify-end lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-none">
              <Button
                type="submit"
                disabled={!isValid || createLoading || !isDirty}
                className="h-10 flex-1 lg:flex-none lg:w-34 rounded-2xl"
              >
                {createLoading && <Spinner />} Save address
              </Button>
            </div>
          </motion.aside>
        </div>
      </div>
    </form>
  );
};

export default CreateAddressForm;
