import { Button } from "@/lib/ui/__shadcn__/button";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import AddressList from "./components/AddressList";

export default function AddressesPage() {
  return (
    <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Addresses</h3>
          <p className="text-sm text-muted-foreground">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <Link to="add">
          <Button size="sm" variant="outline">
            <Plus className="size-4 mr-2" /> Add Address
          </Button>
        </Link>
      </div>

      <Separator />

      <AddressList />
    </div>
  );
}
