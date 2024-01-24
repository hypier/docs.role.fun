import React from "react";
import {
  DialogOrDrawer,
  DialogOrDrawerContent,
  DialogOrDrawerHeader,
  DialogOrDrawerDescription,
} from "@repo/ui/src/components/dialog-or-drawer";
import { useCrystalDialog } from "./lib/hooks/use-crystal-dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@repo/ui/src/components";
import CurrentCrystals from "./current-crystals";
import { DialogPortal } from "@repo/ui/src/components/dialog";
import { MobilePackageWrapper } from "./crystals/mobile-package";
import { packages } from "./crystals/packages";

const CrystalDialog: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, closeDialog } = useCrystalDialog();

  return (
    <DialogOrDrawer
      open={isOpen}
      onOpenChange={closeDialog}
      onPointerDownOutside={closeDialog}
    >
      <DialogPortal>
        <DialogOrDrawerContent className="min-w-fit p-8">
          <DialogOrDrawerHeader className="p-0 text-left">
            <h2>Buy Crystals</h2>
          </DialogOrDrawerHeader>
          <div className="flex flex-col gap-4">
            <DialogOrDrawerDescription>
              Crystals are used per AI features you have used.
            </DialogOrDrawerDescription>
            <div className="flex items-center justify-center gap-2 sm:flex-row">
              {packages.slice(0, 2).map((pkg) => (
                <MobilePackageWrapper
                  key={pkg.src}
                  src={pkg.src}
                  amount={pkg.amount as any}
                  bonus={pkg.bonus}
                  price={pkg.price}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <CurrentCrystals />
            <Button variant="ghost" className="w-fit">
              {t("Shop")}
            </Button>
          </div>
        </DialogOrDrawerContent>
      </DialogPortal>
    </DialogOrDrawer>
  );
};

export default CrystalDialog;
