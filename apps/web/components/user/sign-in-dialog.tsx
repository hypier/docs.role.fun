"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/src/components/alert-dialog";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@repo/ui/src/components";
import { useSessionStorage } from "@uidotdev/usehooks";

const SignInDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: any;
}) => {
  const { t } = useTranslation();
  const [isIgnored, setIsIgnored] = useSessionStorage("sign-in-dialog", false);

  return (
    <AlertDialog
      open={isOpen && !isIgnored}
      onOpenChange={(value) => {
        setIsOpen(value);
        setIsIgnored(value);
      }}
    >
      <AlertDialogContent>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={() => {
            setIsOpen(false);
            setIsIgnored(true);
          }}
        >
          <X />
        </Button>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-1 text-3xl">
            {t("Sign up and continue browsing")}
          </AlertDialogTitle>
          <div className="flex w-full flex-col items-center justify-center">
            <AlertDialogDescription className="flex flex-col items-center justify-center gap-4">
              <div className="flex text-center">
                {t(
                  "Create an account to have fun with characters you'll love!",
                )}
              </div>
            </AlertDialogDescription>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Link href="https://accounts.openroleplay.ai/sign-up">
              <AlertDialogAction>{t("Sign up")}</AlertDialogAction>
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span>{t("Already have an account?")}</span>
              <span className="underline">{t("Sign in")}</span>
            </Link>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SignInDialog;
