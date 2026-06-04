import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { useState } from "react";
import { useNavigate } from "react-router";

interface AuthRequiredDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override the default description */
  message?: string;
  /** Optional custom callback for sign up – defaults to navigating to /signup */
  onSignup?: () => void;
  /** Optional custom callback for log in – defaults to navigating to /login */
  onLogin?: () => void;
}

export function AuthRequiredDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  message = "You need an account to perform this action. Please sign up or log in to continue.",
  onSignup,
  onLogin,
}: AuthRequiredDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navi = useNavigate();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navi("/auth/signup");
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navi("/auth/login");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Sign up or Log in</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <Button onClick={handleSignup} variant={"default"}>
            Sign up
          </Button>

          <Button onClick={handleLogin} variant={"outline"}>
            Log in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
