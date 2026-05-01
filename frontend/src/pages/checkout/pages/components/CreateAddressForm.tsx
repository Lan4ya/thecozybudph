import { motion } from "framer-motion";
import { ChevronLeft, Hash, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAddressSchema } from "@TheCozyBud/schemas";

type FormValues = z.infer<typeof createAddressSchema>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

const defaultValues: FormValues = {
  fullName: "",
  phoneNumber: "",
  postalCode: "",
  region: "",
  province: "",
  city: "",
  barangay: "",
  addressLine: "",
  isDefault: false,
};

const CreateAddressForm = ({ closeForm }: { closeForm: () => void }) => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(createAddressSchema),
    mode: "onChange",
  });

  const isDefault = watch("isDefault");

  const onSubmit = (values: FormValues) => {
    console.log("submit address payload", values);
    // call api here
    // closeForm();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="" noValidate>
      <div className="custom-container max-w-7xl px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 mb-6 grid grid-cols-3 justify-items-center items-center border-b border-border/40 bg-background/90 pb-3 pt-2 backdrop-blur"
        >
          <Button
            onClick={closeForm}
            variant="minimal"
            size="auto"
            className="justify-self-start"
          >
            <ChevronLeft className="text-muted-foreground" />
          </Button>

          <h1 className="text-xl font-semibold text-foreground">
            Create Address
          </h1>
        </motion.div>

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

            <div className="space-y-4">
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
                      {...register("phoneNumber", {
                        setValueAs: (value: string) => {
                          if (!value) return "";
                          return `+63${value}`;
                        },
                      })}
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
                    Province{" "}
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
            </div>
          </motion.section>

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
                onClick={() =>
                  setValue("isDefault", !isDefault, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
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
            disabled={!isValid || isSubmitting}
            className="h-12 flex-1 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:min-w-44"
          >
            Save address
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateAddressForm;
