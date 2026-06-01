import { supabase } from "@/lib/supabase/client";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  Shield,
  ShoppingBag,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { handleError } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { getAvatarUrls } from "@/lib/utils/avatars";
import { cn } from "@/lib/utils/cn";
import { ProgressiveImage } from "@/components/ProgressiveImage";

const Row = ({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="hover:bg-primary/15 w-full flex items-center justify-between px-2 py-3 rounded-md cursor-pointer transition-colors"
  >
    <div className="flex items-center gap-3 text-sm md:text-base">
      {icon}
      {label}
    </div>
    <ChevronRight className="size-4 text-muted" />
  </button>
);

const Section = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="bg-card rounded-xl border overflow-hidden p-4">
    {title && (
      <div className="pb-3 text-xs text-muted uppercase tracking-wide px-2">
        {title}
      </div>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

const Profile = () => {
  const session = useAuthStore((s) => s.session);
  const isAdmin = session?.user?.app_metadata?.role === "admin";

  const [signingOut, setSigningOut] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const user = session?.user;

  const userName =
    user?.user_metadata?.display_name ?? user?.email?.split("@")[0];

  const [avatarUrl, setAvatarUrl] = useState<string>("/fallback-avatar.webp");

  useEffect(() => {
    if (!user) return;

    const initAvatar = async () => {
      // Use user's avatar if available
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
        return;
      }

      // Fallback to trigger-populated avatar_path (random avatar from avatar set)
      const avatarPath = user?.user_metadata?.avatar_path;
      if (avatarPath) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarPath);
        const publicUrl = data.publicUrl;
        setAvatarUrl(publicUrl);

        // Persist it to avatar_url so we don't do this check again
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: publicUrl },
          });
        } catch (err) {
          isDev &&
            console.error("Failed to auto-persist fallback avatar:", err);
        }
      }
    };

    initAvatar();

    // Load available list for the dialog
    getAvatarUrls().then(setAvailableAvatars);
  }, [user]);

  const createdAt = user?.created_at;
  const formattedCreateAt = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  const handleOpenAvatarDialog = () => {
    setSelectedAvatar(user?.user_metadata?.avatar_url ?? null);
    setIsAvatarDialogOpen(true);
  };

  const handleUpdateAvatar = async () => {
    if (!selectedAvatar) return;
    setUpdatingAvatar(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: selectedAvatar },
      });
      if (error) throw error;

      addToast("Avatar updated successfully!", "success");
      setIsAvatarDialogOpen(false);
    } catch (err) {
      const message = handleError(err);
      addToast("Failed to update avatar.", "error");
      isDev && console.error(message);
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message = handleError(err);
      addToast("Logout failed. Please try again.", "error");
      isDev && console.error(message);

      setSigningOut(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-card/40 p-5 rounded-xl border">
          <button
            onClick={handleOpenAvatarDialog}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border shrink-0 hover:ring-2 hover:ring-primary transition-all cursor-pointer"
          >
            <ProgressiveImage
              src={avatarUrl}
              loading="eager"
              decoding="sync"
              alt="avatar"
            />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xl xl:text-2xl font-semibold truncate">
              {userName}{" "}
            </p>

            <p className="text-muted text-xs">Joined: {formattedCreateAt}</p>
          </div>
        </div>

        {/* Avatar Selection Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose an Avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 py-4 max-h-[400px] overflow-y-auto pr-2">
              {availableAvatars.map((url) => (
                <button
                  key={url}
                  onClick={() => setSelectedAvatar(url)}
                  className={cn(
                    "relative aspect-square rounded-full overflow-hidden border-2 transition-all max-w-[100px] mx-auto w-full",
                    selectedAvatar === url
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-primary/50",
                  )}
                >
                  <img
                    src={url}
                    alt="Available avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {availableAvatars.length === 0 && (
                <div className="col-span-3 flex justify-center py-8">
                  <Spinner className="size-8" />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleUpdateAvatar}
                disabled={updatingAvatar || !selectedAvatar}
              >
                {updatingAvatar && <Spinner className="mr-2" />}
                {updatingAvatar ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left (Main) */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Account">
              <Row
                label="My Purchases"
                icon={<ShoppingBag className="size-4 text-primary" />}
                onClick={() => navigate("/profile/my-purchases")}
              />
              <Row
                label="Settings"
                icon={<Settings className="size-4 text-primary" />}
                onClick={() => navigate("/profile/settings")}
              />
              <Row
                label="FAQ"
                icon={<HelpCircle className="size-4 text-primary" />}
                onClick={() => navigate("/FAQ")}
              />
            </Section>

            {isAdmin && (
              <Section title="Admin">
                <Row
                  label="Dashboard"
                  icon={<Shield className="size-4 text-primary" />}
                  onClick={() => navigate("/profile/admin")}
                />
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <Section title="Danger Zone">
              <div className="p-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  {signingOut && <Spinner />}
                  {signingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
