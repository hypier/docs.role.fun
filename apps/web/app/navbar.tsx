"use client";

import Link from "next/link";
import TextLogo from "@repo/ui/src/components/text-logo";
import { Badge } from "@repo/ui/src/components/badge";
import useScroll from "@repo/ui/src/hooks/use-scroll";
import UserDropdown from "../components/user/user-dropdown";
import { Button, Tooltip } from "@repo/ui/src/components";
import { SignedOut } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import useCurrentUser from "./lib/hooks/use-current-user";
import { Search } from "@repo/ui/src/components/icons";

export default function NavBar({}: {}) {
  const scrolled = useScroll(50);
  const { isAuthenticated } = useConvexAuth();
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const isPlus = currentUser?.subscriptionTier === "plus";

  return (
    <>
      <div
        className={`absolute top-0 flex w-full justify-center ${
          scrolled ? "border-b bg-background/50 backdrop-blur-xl" : "bg-white/0"
        } z-30 transition-opacity`}
      >
        <div className={`mx-5 flex h-16 w-full items-center justify-between `}>
          <div className="flex items-center gap-4 font-display text-2xl">
            <Link href="/">
              <TextLogo isPlus={isPlus} />
            </Link>
            {isAuthenticated ? (
              <>
                {!isPlus && (
                  <Link
                    href="/crystals"
                    className="flex items-center justify-center"
                  >
                    <Badge className="w-fit font-display">
                      {t("Get ORP+")}
                    </Badge>
                  </Link>
                )}
              </>
            ) : (
              <Tooltip content="Star openroleplay.ai on GitHub" desktopOnly>
                <Link
                  className="hidden items-center gap-2 text-base text-muted-foreground hover:opacity-50 lg:flex"
                  href="/github"
                >
                  <Badge className="font-default">
                    <span>{t("alpha")}</span>
                  </Badge>
                </Link>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Search characters" desktopOnly>
              <Link href="/search">
                <Button
                  className="rounded-full p-2"
                  variant="ghost"
                  size="icon"
                >
                  <Search className="h-5 w-5 p-px text-foreground" />
                </Button>
              </Link>
            </Tooltip>
            {isAuthenticated && (
              <Link href="/my-characters/create" className="hidden lg:block">
                <Button className="gap-0.5 rounded-full px-3" variant="cta">
                  <Plus className="h-4 w-4" />
                  {t("Create")}
                </Button>
              </Link>
            )}

            <UserDropdown />
            <SignedOut>
              <Link href="/sign-in">
                <Button
                  className="hidden rounded-full px-3 md:block"
                  variant="cta"
                >
                  {t("Log in")}
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </>
  );
}
