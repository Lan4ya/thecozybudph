import { Button } from "@/lib/ui/__shadcn__/button";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import AddressList from "./components/AddressList";

export default function AddressesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-header tracking-tight text-foreground md:text-4xl">
            My Addresses
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <Link to="add">
          <Button size="sm" variant="outline">
            <Plus className="size-4 mr-2" /> Add Address
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm">
        <AddressList />
      </div>
    </div>
  );
}
