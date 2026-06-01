import { Separator } from "@/lib/ui/__shadcn__/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useState, useMemo } from "react";
import { EditUsernameDialog } from "./components/EditUsernameDialog";
import { supabase } from "@/lib/supabase/client";

const Row = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="hover:bg-primary/15 w-full flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors"
  >
    <span className="text-sm md:text-base text-muted-foreground">{label}</span>
    <div className="flex-center gap-4">
      {value}
      <ChevronRight className="size-4 text-muted" />
    </div>
  </button>
);

export default function AccountPage() {
  const userName = useAuthStore((state) => state.userName);
  const email = useAuthStore((state) => state.session?.user?.email);

  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const displayEmail = useMemo<string>(() => {
    if (!email) return "";
    if (showEmail) return email;

    const [local, domain] = email.split("@");
    if (!domain) return email;

    if (local.length <= 2) {
      return `${local[0]}${"*".repeat(Math.max(0, local.length - 1))}@${domain}`;
    }

    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  }, [email, showEmail]);

  const handleSaveUsername = async (newUsername: string): Promise<void> => {
    // Note: `onAuthStateChange` listener will automatically
    // catch this update, fire `setSession`, and update the Zustand store.
    const { error } = await supabase.auth.updateUser({
      data: { display_name: newUsername },
    });

    if (error) throw error;
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your personal details.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          {/* Username */}
          <Row
            label="Username"
            value={userName ?? ""}
            onClick={() => setIsDialogOpen(true)}
          />
          {/* Email */}
          <div className="">
            <button
              onClick={() => setShowEmail((prev) => !prev)}
              className="px-2 hover:bg-primary/15 w-full flex items-center justify-between py-2 rounded-md cursor-pointer transition-colors"
            >
              <span className="text-sm md:text-base text-muted-foreground">
                Email
              </span>
              <div className="flex-center gap-4">
                {displayEmail}
                {showEmail ? (
                  <Eye className="size-4 text-muted" />
                ) : (
                  <EyeOff className="size-4 text-muted" />
                )}
              </div>
            </button>

            <p className="px-2 text-xs text-muted-foreground mt-1">
              We don't currently support changing emails. If you're having
              trouble about your acount, please contact our customer support:{" "}
              <span className="text-foreground">thecozybudph@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      <EditUsernameDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentUsername={userName ?? ""}
        onSave={handleSaveUsername}
      />
    </div>
  );
}
