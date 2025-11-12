// @ts-ignore
import type { NewProduct, UpdateProduct } from "@TheCozyBud/dist.index.d.ts";
import { CustomError } from "../errors/CustomError.ts";
import { validateStringField } from "./_validateStringField.ts";
import { validateIfDefined } from "./_validateIfDefined.ts";

const validateName = (
  name: string,
  errors: { message: string; field?: string }[],
) => {
  validateStringField(name, "name", errors, 100, true);
};

const validateCollectionName = (
  collectionName: string,
  errors: { message: string; field?: string }[],
) => {
  validateStringField(collectionName, "collection_name", errors, 100, false); // not required
};

const validateDescription = (
  description: string,
  errors: { message: string; field?: string }[],
) => {
  validateStringField(description, "description", errors, 500, false); // increased max length for description
};

const validatePrice = (
  price: number,
  errors: { message: string; field?: string }[],
) => {
  if (typeof price !== "number" || isNaN(price)) {
    errors.push({ field: "price", message: "Price must be a valid number." });
  } else if (!Number.isFinite(price)) {
    errors.push({ field: "price", message: "Price must be a finite number." });
  } else if (price < 0) {
    errors.push({ field: "price", message: "Price cannot be negative." });
  } else if (price > 1000000) {
    errors.push({ field: "price", message: "Price cannot exceed 1,000,000." });
  }
};

const validateColorVariants = (
  color_variants: string[],
  errors: { message: string; field?: string }[],
) => {
  if (!Array.isArray(color_variants)) {
    errors.push({
      field: "color_variants",
      message: "Color variants must be an array.",
    });
  } else {
    color_variants.forEach((color, i) => {
      if (typeof color !== "string" || !color.trim()) {
        errors.push({
          field: `color_variants[${i}]`,
          message: "Color variant cannot be empty.",
        });
      } else if (color.length > 50) {
        errors.push({
          field: `color_variants[${i}]`,
          message: "Color variant cannot exceed 50 characters.",
        });
      }
    });
  }
};

// Main validation functions

export function validateNewProductMetadata(product: NewProduct): void {
  const errors: { message: string; field?: string }[] = [];

  validateName(product.name, errors);
  validatePrice(product.price, errors);
  validateCollectionName(product.collection_name, errors);
  validateDescription(product.description, errors);
  validateIfDefined(product.color_variants, validateColorVariants, errors);

  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}

export function validateUpdateProductMetadata(updates: UpdateProduct): void {
  const errors: { message: string; field?: string }[] = [];

  validateIfDefined(updates.name, validateName, errors);
  validateIfDefined(updates.price, validatePrice, errors);
  validateIfDefined(updates.color_variants, validateColorVariants, errors);
  validateIfDefined(updates.collection_name, validateCollectionName, errors);
  validateIfDefined(updates.description, validateDescription, errors);

  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}
