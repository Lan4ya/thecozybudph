import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/__shadcn__/dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

interface EditUsernameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  onSave: (newUsername: string) => Promise<void>;
}

export function EditUsernameDialog({
  isOpen,
  onOpenChange,
  currentUsername,
  onSave,
}: EditUsernameDialogProps) {
  const [username, setUsername] = useState<string>(currentUsername);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || username === currentUsername) return;

    setIsPending(true);
    try {
      await onSave(username.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update username:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update username</DialogTitle>
          <DialogDescription>
            Enter a new display name for your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isPending}
            placeholder="Enter username"
            required
            className="w-full px-3 py-2 text-sm rounded-md border bg-background border-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isPending || !username.trim() || username === currentUsername
              }
              className="w-full sm:w-auto"
            >
              {isPending && <Spinner />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
