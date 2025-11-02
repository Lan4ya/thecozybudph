import type { NewProduct, UpdateProduct } from "@TheCozyBud/types";
import { CustomError } from "./errors/CustomError.ts";

const validateName = (
  name: string,
  errors: { message: string; field?: string }[],
) => {
  const trimmedName = name.trim();
  const nameLength = trimmedName.length;

  if (!trimmedName) {
    errors.push({ field: "name", message: "Name is required." });
  } else if (nameLength < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long.",
    });
  } else if (nameLength > 100) {
    errors.push({
      field: "name",
      message: "Name cannot exceed 100 characters.",
    });
  }
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

const validateStock = (
  stock: number,
  errors: { message: string; field?: string }[],
) => {
  if (!Number.isInteger(stock)) {
    errors.push({ field: "stock", message: "Stock must be a whole number." });
  } else if (stock < 0) {
    errors.push({ field: "stock", message: "Stock cannot be negative." });
  } else if (stock > 100000) {
    errors.push({ field: "stock", message: "Stock cannot exceed 100,000." });
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
  } else if (color_variants.length === 0) {
    errors.push({
      field: "color_variants",
      message: "Color variants must have at least one value.",
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

const validateCollectionName = (
  collection_name: string,
  errors: { message: string; field?: string }[],
) => {
  const trimmedCollection = collection_name.trim();
  const collectionLength = trimmedCollection.length;

  if (collectionLength === 0) {
    errors.push({
      field: "collection_name",
      message: "Collection name cannot be empty.",
    });
  } else if (collectionLength < 2) {
    errors.push({
      field: "collection_name",
      message: "Collection name must be at least 2 characters long.",
    });
  } else if (collectionLength > 100) {
    errors.push({
      field: "collection_name",
      message: "Collection name cannot exceed 100 characters.",
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
  validateStock(product.stock, errors);

  validateIfDefined(product.collection_name, validateCollectionName, errors);
  validateIfDefined(product.color_variants, validateColorVariants, errors);

  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}

export function validateProductUpdate(updates: UpdateProduct): void {
  const errors: { message: string; field?: string }[] = [];

  validateIfDefined(updates.name, validateName, errors);
  validateIfDefined(updates.price, validatePrice, errors);
  validateIfDefined(updates.stock, validateStock, errors);
  validateIfDefined(updates.color_variants, validateColorVariants, errors);
  validateIfDefined(updates.collection_name, validateCollectionName, errors);

  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}
