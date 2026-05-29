import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function AccountPage() {
  const [form, setForm] = useState({
    displayName: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    bio: "Flower enthusiast & loyal customer 🌸",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal details and public profile.
          </p>
        </div>

        <Separator />

        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayName: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input value={form.email} className="pl-9" readOnly />
            </div>
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
