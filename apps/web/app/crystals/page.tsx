"use client";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Tooltip,
} from "@repo/ui/src/components";
import { Crystal } from "@repo/ui/src/components/icons";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import useCurrentUser from "../lib/hooks/use-current-user";
import { AnimatePresence, motion } from "framer-motion";
import { FadeInOut } from "../lib/utils";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useModelData from "../lib/hooks/use-model-data";
import {
  Table,
  TableBody,
  TableHeader,
  TableCell,
  TableRow,
  TableCaption,
  TableHead,
} from "@repo/ui/src/components/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/src/components/collapsible";
import ModelBadge from "../../components/characters/model-badge";
import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import useImageModelData from "../lib/hooks/use-image-model-data";

export const MobilePackage = ({
  src,
  amount,
  bonus,
  price,
  handlePurchaseClick,
}: {
  src: string;
  amount: 300 | 1650 | 5450 | 11200 | 19400 | 90000;
  bonus: number;
  price: number;
  handlePurchaseClick?: any;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Tooltip
      content={`Buy ${amount - bonus} ${
        bonus > 0 ? `(+ Bonus ${bonus})` : ""
      } crystals`}
      desktopOnly
    >
      <Card
        className="relative aspect-square h-full w-full rounded-lg tabular-nums duration-200 hover:shadow-lg md:h-64 md:w-64"
        role="button"
        onClick={
          handlePurchaseClick
            ? (e) => handlePurchaseClick(e)
            : () => router.push("/sign-in")
        }
      >
        <Image
          src={src}
          width={256}
          height={256}
          alt={"image for pricing"}
          className="absolute top-0 h-full w-full rounded-lg object-cover"
        />
        <div className="absolute bottom-0 h-[50%] w-full rounded-b-lg bg-gradient-to-b from-transparent via-white/95 to-white" />
        <div className="flex flex-col gap-1 pt-[70%]">
          <CardHeader className="flex items-center justify-center py-1">
            <CardTitle className="z-10 text-base text-black">
              {amount.toLocaleString()} {t("Crystals")}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex w-full items-center justify-center">
            <p className="z-10 w-full rounded-full text-center text-sm font-semibold text-sky-900">
              {price}$
            </p>
          </CardFooter>
        </div>
      </Card>
    </Tooltip>
  );
};

const Package = ({
  src,
  amount,
  bonus,
  price,
  handlePurchaseClick,
}: {
  src: string;
  amount: 300 | 1650 | 5450 | 11200 | 19400 | 90000;
  bonus: number;
  price: number;
  handlePurchaseClick?: any;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Tooltip
      content={`Buy ${amount - bonus} ${
        bonus > 0 ? `(+ Bonus ${bonus})` : ""
      } crystals`}
      desktopOnly
    >
      <Card
        className="relative aspect-square h-[23rem] w-[23rem] rounded-lg tabular-nums duration-200 hover:shadow-lg md:h-64 md:w-64"
        role="button"
        onClick={
          handlePurchaseClick
            ? (e) => handlePurchaseClick(e)
            : () => router.push("/sign-in")
        }
      >
        <Image
          src={src}
          width={256}
          height={256}
          alt={"image for pricing"}
          className="absolute top-0 h-full w-full rounded-lg object-cover"
        />
        <div className="absolute bottom-0 h-[50%] w-full rounded-b-lg bg-gradient-to-b from-transparent via-white/95 to-white" />
        <div className="flex flex-col gap-1 pt-[70%]">
          <CardHeader className="flex items-center justify-center py-1">
            <CardTitle className="z-10 text-xl text-black">
              {(amount - bonus).toLocaleString()} {t("Crystals")}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex w-full items-center justify-center">
            <p className="z-10 w-full rounded-full bg-sky-100 text-center font-semibold text-sky-900">
              {price}$ <span className="text-xs">+VAT</span>
            </p>
          </CardFooter>
        </div>
        {bonus > 0 && (
          <div className="absolute -left-2 -top-2 flex w-fit items-center gap-0.5 rounded-full bg-rose-500 p-1 px-2 text-sm font-medium text-white">
            <span className="text-amber-200">{t("Bonus")} </span>
            <Crystal className="h-4 w-4" /> {bonus}
          </div>
        )}
      </Card>
    </Tooltip>
  );
};

const PackageWrapper = ({
  src,
  amount,
  bonus,
  price,
}: {
  src: string;
  amount: 300 | 1650 | 5450 | 11200 | 19400 | 90000;
  bonus: number;
  price: number;
}) => {
  const buyCrystal = useAction(api.stripe.pay);
  const currentUser = useCurrentUser();
  async function handlePurchaseClick(event: any) {
    event.preventDefault();
    const promise = buyCrystal({
      numCrystals: amount,
      userId: currentUser._id,
    });
    toast.promise(promise, {
      loading: "Redirecting to purchase page...",
      success: (paymentUrl) => {
        console.log("paymentUrl::", paymentUrl);
        window.location.href = paymentUrl!;
        return `Now you can proceed to purchase.`;
      },
      error: (error) => {
        return error
          ? (error.data as { message: string }).message
          : "Unexpected error occurred";
      },
    });
  }

  return (
    <Package
      src={src}
      amount={amount}
      bonus={bonus}
      price={price}
      handlePurchaseClick={handlePurchaseClick}
    />
  );
};

const DailyReward = () => {
  const { t } = useTranslation();
  const checkin = useMutation(api.serve.checkin);
  const checkedIn = useQuery(api.serve.checkedIn);
  const onClickHandler = async () => {
    const promise = checkin();
    toast.promise(promise, {
      loading: "Claiming your daily reward...",
      success: () => {
        return t(
          `Daily reward claimed successfully! Don't forget to return tomorrow for more rewards.`,
        );
      },
      error: (error) => {
        return error
          ? (error.data as { message: string }).message
          : "Unexpected error occurred";
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 px-5">
      <h1 className="font-display text-5xl">{t("Daily Rewards")}</h1>
      <AnimatePresence>
        {checkedIn && (
          <motion.p
            className="flex items-center gap-1 text-sm text-muted-foreground"
            {...FadeInOut}
          >
            <Crystal className="hidden h-4 w-4 md:inline" />
            {t("You've already claimed today's reward.")}
          </motion.p>
        )}
      </AnimatePresence>
      <Button onClick={onClickHandler} disabled={checkedIn}>
        {t("Claim 25 Crystals")}
      </Button>
    </div>
  );
};

export const packages = [
  { src: "/shop/tier1.png", amount: 300, bonus: 0, price: 0.99 },
  { src: "/shop/tier2.png", amount: 1650, bonus: 150, price: 4.99 },
  { src: "/shop/tier3.png", amount: 5450, bonus: 550, price: 14.99 },
  { src: "/shop/tier4.png", amount: 11200, bonus: 1300, price: 29.99 },
  { src: "/shop/tier5.png", amount: 19400, bonus: 3000, price: 49.99 },
  { src: "/shop/tier6.png", amount: 90000, bonus: 8000, price: 99.99 },
];

export default function Page() {
  const modelData = useModelData();
  const imageModelData = useImageModelData();
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isImageTableOpen, setIsImageTableOpen] = useState(false);
  const currentUser = useCurrentUser();
  const crystals = currentUser?.crystals;

  return (
    <div className="flex w-full flex-col items-center gap-24 justify-self-start bg-background px-2 pb-32 pt-16 lg:mr-4 lg:rounded-lg lg:border lg:shadow-lg">
      <div className="flex flex-col items-center gap-4 px-5">
        <h1 className="font-display text-5xl">{t("Crystals")}</h1>
        <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
          {t("Crystal Top-Up")}
        </h2>
        <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
          {t(
            "Crystal is an universal currency for calling AI features in openroleplay.ai.",
          )}
        </p>
      </div>
      <AnimatePresence>
        {isAuthenticated ? (
          <motion.section
            {...FadeInOut}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {packages.map((pkg) => (
              <PackageWrapper
                key={pkg.src}
                src={pkg.src}
                amount={pkg.amount as any}
                bonus={pkg.bonus}
                price={pkg.price}
              />
            ))}
          </motion.section>
        ) : (
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Package
                key={pkg.src}
                src={pkg.src}
                amount={pkg.amount as any}
                bonus={pkg.bonus}
                price={pkg.price}
              />
            ))}
          </section>
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center justify-center gap-4">
        {t("If you prefer, you can also support us through Patreon.")}
        <Link
          href={"https://www.patreon.com/openroleplay/membership"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="flex w-fit gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1080 1080"
              className="h-4 w-4 fill-white dark:fill-black"
            >
              <path
                d="M1033.05,324.45c-0.19-137.9-107.59-250.92-233.6-291.7c-156.48-50.64-362.86-43.3-512.28,27.2
    C106.07,145.41,49.18,332.61,47.06,519.31c-1.74,153.5,13.58,557.79,241.62,560.67c169.44,2.15,194.67-216.18,273.07-321.33
    c55.78-74.81,127.6-95.94,216.01-117.82C929.71,603.22,1033.27,483.3,1033.05,324.45z"
              />
            </svg>
            Become a Patreon
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-16 rounded-lg px-5">
        <div className="flex flex-col items-center gap-4 rounded-lg">
          <h1 className="font-display text-5xl">{t("Crystal Price")}</h1>
          <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Text models")}
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            {t(
              "Crystal is used whenever you send message to character, regenerate response or continue conversation.",
            )}
          </p>
          <Collapsible
            open={isTableOpen}
            onOpenChange={setIsTableOpen}
            className="flex flex-col items-center gap-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                {isTableOpen ? t("Hide") : t("Show")}

                <ChevronsUpDown className="h-4 w-4 p-0.5 opacity-50" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card>
                <Table>
                  <TableCaption className="text-xs lg:text-sm">
                    {t("Crystal Price Table")}
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="text-xs lg:text-sm">
                      <TableHead>{t("Badge")}</TableHead>
                      <TableHead>{t("Name")}</TableHead>
                      <TableHead className="text-right">
                        {t("Crystals")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelData
                      .sort((a: any, b: any) => a.crystalPrice - b.crystalPrice)
                      .map((model: any) => (
                        <TableRow
                          key={model.value}
                          className="text-xs lg:text-sm"
                        >
                          <TableCell>
                            <ModelBadge
                              modelName={model.value}
                              collapse={false}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {model.description}
                          </TableCell>
                          <TableCell className="text-right">
                            {model.crystalPrice ? (
                              model.crystalPrice
                            ) : (
                              <span className="font-medium text-teal-500">
                                FREE
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg">
          <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Image models")}
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            {t("Crystal is used whenever you generate an image.")}
          </p>
          <Collapsible
            open={isImageTableOpen}
            onOpenChange={setIsImageTableOpen}
            className="flex flex-col items-center gap-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                {isTableOpen ? t("Hide") : t("Show")}

                <ChevronsUpDown className="h-4 w-4 p-0.5 opacity-50" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card>
                <Table>
                  <TableCaption className="text-xs lg:text-sm">
                    {t("Crystal Price Table")}
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="text-xs lg:text-sm">
                      <TableHead>{t("Badge")}</TableHead>
                      <TableHead>{t("Name")}</TableHead>
                      <TableHead className="text-right">
                        {t("Crystals")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imageModelData
                      .sort((a: any, b: any) => a.crystalPrice - b.crystalPrice)
                      .map((model: any) => (
                        <TableRow
                          key={model.value}
                          className="text-xs lg:text-sm"
                        >
                          <TableCell>
                            <ModelBadge
                              modelName={model.value}
                              collapse={false}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {model.description}
                          </TableCell>
                          <TableCell className="text-right">
                            {model.crystalPrice ? (
                              model.crystalPrice
                            ) : (
                              <span className="font-medium text-teal-500">
                                FREE
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg">
          <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("AI Voice")}
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            {t(
              "Crystal is used whenever you request voice playback for a specific message.",
            )}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg">
          <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Machine Translation")}
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            {t(
              "Crystal is used whenever you request a translation for a message",
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-5">
        <h1 className="font-display text-5xl">{t("Free Crystals")}</h1>
        <h2 className="bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text text-center font-display text-3xl text-transparent">
          {t("Create characters and earn crystals.")}
        </h2>
        <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
          <Crystal className="hidden h-4 w-4 md:inline" />
          {t(
            "You can earn crystals whenever other users interact with the characters you've created.",
          )}
        </p>
        <Link href="/my-characters/create" className="hidden lg:block">
          <Button className="rounded-full px-3">
            <Plus className="h-5 w-5 p-1" />
            {t("Create")}
          </Button>
        </Link>
      </div>

      <AnimatePresence>{isAuthenticated && <DailyReward />}</AnimatePresence>
    </div>
  );
}
