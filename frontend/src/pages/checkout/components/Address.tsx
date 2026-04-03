import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";

// Mock address data – replace with actual user address from store/API
const mockAddress = {
  fullName: "Jeremiah Francia",
  phoneNumber: "+63 995 095 8391",
  addressLine: "1462 (room 4G) G. Tuazon Street, Barangay 411 Sampaloc Manila",
  barangay: "Barangay 411",
  city: "Sampaloc",
  province: "Metro Manila",
  region: "Metro Manila",
  postalCode: "1008",
};

const AddressSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Delivery Address</h2>
        </div>
        <Button variant="minimal" size="sm" className="text-primary gap-1">
          Change <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{mockAddress.fullName}</p>
        <p className="text-muted-foreground">{mockAddress.phoneNumber}</p>
        <p className="text-muted-foreground">{mockAddress.addressLine}</p>
        <p className="text-muted-foreground">
          {mockAddress.barangay}, {mockAddress.city}, {mockAddress.province}{" "}
          {mockAddress.postalCode}
        </p>
      </div>
    </motion.div>
  );
};

export default AddressSection;
