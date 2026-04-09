import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/ui/__shadcn__/card";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";

const ErrorDialogue = ({ msg }: { msg: string }) => {
  const nav = useNavigate();

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-center -mb-5 text-xl font-semibold text-destructive">
            Error
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground line-clamp-4">{msg}</p>

          <Button className="w-full" onClick={() => nav(0)}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
};

export default ErrorDialogue;
