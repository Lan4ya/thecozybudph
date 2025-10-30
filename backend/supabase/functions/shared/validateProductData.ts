import type { NewProduct } from "@TheCozyBud/types";
import { CustomError } from "./errors/CustomError.ts";

export function validateProductData({
  name,
  price,
  stock,
  color_variants,
  collection_name,
}: NewProduct): void {
  const errors: { message: string; field?: string }[] = [];

  // Validate name
  if (!name || !name.trim()) {
    errors.push({ field: "name", message: "Product name is required" });
  } else if (name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Product name must be at least 2 characters long",
    });
  } else if (name.trim().length > 100) {
    errors.push({
      field: "name",
      message: "Product name cannot exceed 100 characters",
    });
  }

  // Validate price
  if (typeof price !== "number" || isNaN(price)) {
    errors.push({ field: "price", message: "Price must be a valid number" });
  } else if (price < 0) {
    errors.push({ field: "price", message: "Price cannot be negative" });
  } else if (price > 1000000) {
    errors.push({ field: "price", message: "Price cannot exceed 1,000,000" });
  } else if (!Number.isFinite(price)) {
    errors.push({ field: "price", message: "Price must be a finite number" });
  }

  // Validate stock
  if (!Number.isInteger(stock)) {
    errors.push({ field: "stock", message: "Stock must be a whole number" });
  } else if (stock < 0) {
    errors.push({ field: "stock", message: "Stock cannot be negative" });
  } else if (stock > 100000) {
    errors.push({ field: "stock", message: "Stock cannot exceed 100,000" });
  }

  // Validate color variants only if provided since it's optional
  if (color_variants) {
    if (!Array.isArray(color_variants)) {
      errors.push({
        field: "color_variants",
        message: "Color variants must be an array",
      });
    } else if (color_variants.length === 0) {
      errors.push({
        field: "color_variants",
        message: "Color variants must have atleast one value",
      });
    } else {
      for (let i = 0; i < color_variants.length; i++) {
        const color = color_variants[i];
        if (typeof color !== "string" || !color.trim()) {
          errors.push({
            field: `color_variants[${i}]`,
            message: "Color variant cannot be empty",
          });
        } else if (color.length > 50) {
          errors.push({
            field: `color_variants[${i}]`,
            message: "Color variant cannot exceed 50 characters",
          });
        }
      }
    }
  }

  // Validate collection name only if provided since it's optional
  if (collection_name) {
    if (collection_name.trim().length < 2) {
      errors.push({
        field: "collection_name",
        message: "Collectioin name must be at least 2 characters long",
      });
    } else if (collection_name.trim().length > 100) {
      errors.push({
        field: "collection_name",
        message: "Collection name cannot exceed 100 characters",
      });
    }
  }
  // Throw if any validation errors found
  if (errors.length > 0) {
    throw CustomError.validation(errors);
  }
}
