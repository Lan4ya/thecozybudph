export const validateIfDefined = <T>(
  value: T | undefined,
  validator: (val: T, errors: { message: string; field?: string }[]) => void,
  errors: { message: string; field?: string }[],
) => {
  if (value != undefined) {
    validator(value, errors);
  }
};
