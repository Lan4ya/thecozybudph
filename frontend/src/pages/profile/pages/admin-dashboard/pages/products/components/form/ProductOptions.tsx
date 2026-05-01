import { Plus, X } from "lucide-react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProductFormInput } from "@TheCozyBud/schemas";
// import { useEffect } from "react";

export const ProductOptions = ({}) => {
  const { control, watch } = useFormContext<ProductFormInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  // useEffect(() => {
  //   const subscription = watch((value) => {
  //     console.log("options changed:", value.options);
  //   });
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  return (
    <div>
      {fields.map((field, index) => (
        <AddOptionFields
          key={field.id}
          optionIdx={index}
          removeOption={() => remove(index)}
        />
      ))}

      <div className="mb-10">
        <Button
          type="button"
          onClick={() => append({ name: "", values: ["", ""] })}
        >
          <Plus /> Option
        </Button>
      </div>
    </div>
  );
};

type Props = {
  optionIdx: number;
  removeOption: () => void;
};

export function AddOptionFields({ optionIdx, removeOption }: Props) {
  const {
    formState: { errors },
    register,
    setValue,
    watch,
  } = useFormContext<ProductFormInput>();

  const values = watch(`options.${optionIdx}.values`) || ["", ""];

  const optionError = errors.options?.[optionIdx];

  const addValue = () => {
    setValue(`options.${optionIdx}.values`, [...values, ""], {
      shouldValidate: false,
    });
  };

  const removeValue = (idx: number) => {
    setValue(
      `options.${optionIdx}.values`,
      values.filter((_, i) => i !== idx),
      { shouldValidate: false },
    );
  };

  return (
    <div className="mb-10 text-sm  space-y-6 border rounded-md p-2 py-4">
      <div className="flex justify-between items-center">
        <div className="">Option {optionIdx + 1}</div>
        {optionIdx > 0 && (
          <Button
            type="button"
            variant="minimal"
            size="sm"
            onClick={removeOption}
          >
            <X />
          </Button>
        )}
      </div>

      {/* Option Name */}
      <div>
        <label className="block mb-1 text-muted-foreground">Name</label>
        <Input
          {...register(`options.${optionIdx}.name`)}
          placeholder={optionIdx === 0 ? "color" : ""}
        />

        {optionError?.name && (
          <p className="text-xs text-red-500 mt-1">
            {optionError.name.message}
          </p>
        )}
      </div>

      {/* Option Values */}
      <div>
        <label className="block mb-1 text-muted-foreground">Values</label>
        <div className="space-y-3">
          {values.map((_val, valIdx) => (
            <div key={valIdx} className="">
              <div className="relative">
                <Input
                  {...register(`options.${optionIdx}.values.${valIdx}`)}
                  placeholder={
                    optionIdx === 0 && valIdx === 0
                      ? "red-green-yellow"
                      : optionIdx === 0 && valIdx === 1
                        ? "red-white-violet"
                        : ""
                  }
                  className="pr-8"
                />

                {valIdx > 0 && (
                  <Button
                    type="button"
                    variant="minimal"
                    size="sm"
                    onClick={() => removeValue(valIdx)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 "
                  >
                    <X />
                  </Button>
                )}
              </div>

              {optionError?.values?.[valIdx] && (
                <p className="text-xs text-red-500 mt-1">
                  {optionError.values[valIdx].message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Value Field */}
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={addValue}>
          <Plus /> Value
        </Button>
      </div>
    </div>
  );
}
