import { NewProduct, UpdateProduct } from "@TheCozyBud/schema";
import { CustomError } from "./errors/CustomError";

const validateStringField = (
  value: string | undefined,
  fieldName: string,
  errors: { message: string; field?: string }[],
  maxLength: number,
  isRequired: boolean = true,
) => {
  if (value === undefined || value === null) {
    if (isRequired) {
      errors.push({ field: fieldName, message: `${fieldName} is required.` });
    }
    return;
  }

  const trimmedValue = value.trim();
  const valueLength = trimmedValue.length;

  if (isRequired && !trimmedValue) {
    errors.push({ field: fieldName, message: `${fieldName} is required.` });
  } else if (isRequired && valueLength < 1) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least 1 character long.`,
    });
  } else if (valueLength > maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} cannot exceed ${maxLength} characters.`,
    });
  }
};

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

const validateIfDefined = <T>(
  value: T | undefined,
  validator: (val: T, errors: { message: string; field?: string }[]) => void,
  errors: { message: string; field?: string }[],
) => {
  if (value != undefined) {
    validator(value, errors);
  }
};

// Main validation functions

export function validateNewProduct(product: NewProduct): void {
  const errors: { message: string; field?: string }[] = [];

  validateName(product.name, errors);
  validatePrice(product.price, errors);
  validateStringField(
    product.collection_name,
    "collection_name",
    errors,
    100,
    false,
  );
  validateStringField(product.description, "description", errors, 600, false);
  validateIfDefined(product.color_variants, validateColorVariants, errors);

  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}

export function validateProductUpdate(updates: UpdateProduct): void {
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
