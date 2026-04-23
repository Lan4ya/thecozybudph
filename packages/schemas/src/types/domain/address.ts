export type Address = {
  id: string;
  fullName: string;
  postalCode: string;
  region: string;
  city: string;
  province: string | null;
  barangay: string;
  addressLine: string;
  phoneNumber: string;
  isDefault: boolean;
};
