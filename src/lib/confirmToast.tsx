import { toast } from "sonner";

interface ConfirmOpts {
  message: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

export function confirmToast({
  message,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmOpts) {
  toast(message, {
    description,
    duration: 10000,
    action: {
      label: confirmLabel,
      onClick: () => onConfirm(),
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {},
    },
    classNames: {
      actionButton:
        variant === "destructive"
          ? "!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
          : "!bg-primary !text-primary-foreground hover:!opacity-90",
      cancelButton: "!bg-muted !text-muted-foreground hover:!bg-muted/80",
    },
  });
}
