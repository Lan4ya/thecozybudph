export const validateStringField = (
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
