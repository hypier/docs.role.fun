"use client";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  InfoTooltip,
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
import {
  ChevronsUpDown,
  Heart,
  Lock,
  MessageSquare,
  Plus,
  Rabbit,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import useImageModelData from "../lib/hooks/use-image-model-data";
import { packages } from "./packages";
import { usePaymentDialog } from "../lib/hooks/use-crystal-dialog";
import useSubscription from "../lib/hooks/use-subscription";

const PlusPlan = () => {
  const { t } = useTranslation();
  const subscribe = useAction(api.stripe.subscribe);
  const unsubscribe = useMutation(api.payments.unsubscribe);
  const uncancel = useMutation(api.payments.uncancel);
  const currentUser = useCurrentUser();
  const subscription = useSubscription();
  const { setClientSecret, openDialog } = usePaymentDialog();

  async function handlePurchaseClick(event: any) {
    event.preventDefault();
    const promise = subscription?.cancelsAt
      ? uncancel({})
      : subscribe({
          userId: currentUser._id,
        });
    toast.promise(promise, {
      loading: t("Loading purchase details..."),
      success: subscription?.cancelsAt
        ? () => t("Your subscription is renewed.")
        : (clientSecret) => {
            openDialog();
            setClientSecret(clientSecret as string);
            return t(`Now you can proceed to purchase.`);
          },
      error: (error) => {
        return error
          ? (error.data as { message: string }).message
          : t("Unexpected error occurred");
      },
    });
  }

  return (
    <Tooltip content={`Subscribe ORP+`} desktopOnly>
      <Card
        className="relative rounded-xl tabular-nums duration-200 hover:shadow-lg"
        role="button"
        onClick={
          currentUser?.subscriptionTier === "plus" && !subscription?.cancelsAt
            ? undefined
            : (e) => handlePurchaseClick(e)
        }
      >
        <Image
          src={"/shop/orp+.jpg"}
          width={256}
          height={368}
          alt={"image for pricing"}
          className="absolute top-0 h-full w-full rounded-xl object-cover"
        />
        <div className="absolute bottom-0 h-[70%] w-full rounded-b-lg bg-gradient-to-b from-transparent via-gray-900/95 to-gray-900" />
        <div className="flex flex-col gap-1 pt-[50%] lg:pt-[30%] xl:pt-[100%]">
          <CardHeader className="flex items-center justify-center py-1">
            <CardTitle className="z-10 font-display text-xl text-white">
              ORP+
            </CardTitle>
            <CardDescription className="z-10 text-gray-400">
              9.99$
              <span className="text-xs">{" +VAT"}</span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex w-full flex-col items-center justify-center gap-2">
            <ul className="z-10 flex w-full flex-col gap-1 text-xs text-white">
              <li className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {t("30+ Top AI Models Access")}
                <InfoTooltip
                  content={t(
                    "Plus users will get priority access to newly released models.",
                  )}
                />
              </li>
              <li className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {t("Double Character Memory")}
                <InfoTooltip
                  content={t(
                    "Characters will remember more messages from chat.",
                  )}
                />
              </li>
              <li className="flex items-center gap-1">
                <Crystal className="h-4 w-4" />
                {t("Earn 200 Crystals Everyday")}
                <InfoTooltip
                  content={t("Earn upto 6,000 crystals every month.")}
                />
              </li>
              <li className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {t("More Follow-up Answers")}
                <InfoTooltip content={t("Choose from 3 follow-up answers")} />
              </li>
              <li className="flex items-center gap-1">
                <Rabbit className="h-4 w-4" />
                {t("Early Access to Beta Features")}
                <InfoTooltip content={t("More features are coming soon!")} />
              </li>
            </ul>
            <p
              className={`z-10 w-full rounded-full text-center font-semibold ${
                subscription?.cancelsAt
                  ? `bg-yellow-100 text-yellow-900`
                  : currentUser?.subscriptionTier === "plus"
                    ? `bg-blue-100/25 text-blue-100`
                    : `bg-blue-100 text-blue-900`
              }`}
            >
              {subscription?.cancelsAt
                ? t("Renew subscription")
                : currentUser?.subscriptionTier === "plus"
                  ? "Active"
                  : t("Subscribe")}{" "}
            </p>
            {currentUser?.subscriptionTier === "plus" && (
              <CardDescription
                className="z-10 text-xs duration-200 hover:opacity-50"
                onClick={
                  subscription?.cancelsAt
                    ? async (e) => {}
                    : async (e) => {
                        e.stopPropagation();
                        const promise = unsubscribe({});
                        toast.promise(promise, {
                          loading: "Unsubscribing...",
                          success: "Unsubscribe successful",
                          error: "Unsubscribe failed",
                        });
                      }
                }
              >
                {subscription?.cancelsAt
                  ? `Cancelling on ${new Date(
                      subscription.cancelsAt,
                    ).toLocaleDateString()}`
                  : t("Cancel subscription")}
              </CardDescription>
            )}
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
  amount: 150 | 1650 | 5450 | 11200 | 19400 | 90000;
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
        className="relative aspect-square h-[23rem] w-[23rem] rounded-xl tabular-nums duration-200 hover:shadow-lg md:h-64 md:w-64"
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
          className="absolute top-0 h-full w-full rounded-xl object-cover"
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
  amount: 150 | 1650 | 5450 | 11200 | 19400 | 90000;
  bonus: number;
  price: number;
}) => {
  const buyCrystal = useAction(api.stripe.pay);
  const currentUser = useCurrentUser();
  const { t } = useTranslation();
  const { setClientSecret, openDialog } = usePaymentDialog();

  async function handlePurchaseClick(event: any) {
    event.preventDefault();
    const promise = buyCrystal({
      numCrystals: amount,
      userId: currentUser._id,
    });
    toast.promise(promise, {
      loading: t("Loading purchase details..."),
      success: (clientSecret) => {
        openDialog();
        setClientSecret(clientSecret);
        return t(`Now you can proceed to purchase.`);
      },
      error: (error) => {
        return error
          ? (error.data as { message: string }).message
          : t("Unexpected error occurred");
      },
    });
  }

  return (
    <div>
      <Package
        src={src}
        amount={amount}
        bonus={bonus}
        price={price}
        handlePurchaseClick={handlePurchaseClick}
      />
    </div>
  );
};

const DailyReward = () => {
  const { t } = useTranslation();
  const checkin = useMutation(api.serve.checkin);
  const checkedIn = useQuery(api.serve.checkedIn);
  const onClickHandler = async () => {
    const promise = checkin();
    toast.promise(promise, {
      loading: t("Claiming your daily reward..."),
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
      <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text text-center font-display text-3xl text-transparent">
        {t("Daily Rewards")}
      </h2>
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
        {t("Claim 15 Crystals")}
      </Button>
    </div>
  );
};

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
    <div className="relative flex w-full flex-col items-center gap-24 justify-self-start bg-background px-2 pb-32 pt-16 lg:mr-4 lg:rounded-xl lg:border lg:shadow-lg">
      {typeof crystals === "number" && (
        <div
          className={`absolute right-8 top-8 mx-auto flex items-center gap-0.5 font-medium`}
        >
          <Crystal className="h-6 w-6" />
          {Math.floor(crystals)}
        </div>
      )}
      <div className="flex flex-col items-center gap-4 px-5">
        <h1 className="font-display text-5xl">{t("Crystals")}</h1>

        <h2 className="flex items-center justify-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
          {t("Crystal Top-Up")}
          <InfoTooltip
            content={t(
              "Crystal is an universal currency for calling AI features in openroleplay.ai.",
            )}
          />
        </h2>
      </div>

      <AnimatePresence>
        {isAuthenticated ? (
          <div className="flex flex-col gap-8 xl:flex-row">
            <PlusPlan />
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
          </div>
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
      <div className="flex flex-col items-center gap-4 px-5">
        <h1 className="font-display text-5xl">{t("Free Crystals")}</h1>
        <Link href="/my-characters/create" className="group w-full lg:block">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl border p-4 shadow duration-200 group-hover:shadow-lg">
            <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text text-center font-display text-3xl text-transparent">
              {t("Create characters and earn crystals.")}
              <InfoTooltip
                content={t(
                  "You can earn crystals whenever other users interact with the characters you've created.",
                )}
              />
            </h2>
            <Button className="rounded-full px-3">
              <Plus className="h-5 w-5 p-1" />
              {t("Create")}
            </Button>
          </div>
        </Link>
        <AnimatePresence>
          {isAuthenticated && (
            <div className="flex w-full flex-col items-center gap-4 rounded-xl border p-4 shadow duration-200 group-hover:shadow-lg">
              <DailyReward />
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-16 rounded-xl px-5">
        <div className="flex flex-col items-center gap-4 rounded-xl">
          <h1 className="font-display text-5xl">{t("Crystal Price")}</h1>
          <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Text models")}
            <InfoTooltip
              content={t(
                "Crystal is used whenever you send message to character, regenerate response or continue conversation.",
              )}
            />
          </h2>
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
                      ?.sort(
                        (a: any, b: any) => a.crystalPrice - b.crystalPrice,
                      )
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
        <div className="flex flex-col items-center gap-4 rounded-xl">
          <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Image models")}
            <InfoTooltip
              content={t("Crystal is used whenever you generate an image.")}
            />
          </h2>
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
                      ?.sort(
                        (a: any, b: any) => a.crystalPrice - b.crystalPrice,
                      )
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
        <div className="flex flex-col items-center gap-4 rounded-xl">
          <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("AI Voice")}
            <InfoTooltip
              content={t(
                "Crystal is used whenever you request voice playback for a specific message.",
              )}
            />
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            15 x
            <Crystal className="h-4 w-4" />
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl">
          <h2 className="flex items-center gap-1 bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text font-display text-3xl text-transparent">
            {t("Machine Translation")}
            <InfoTooltip
              content={t(
                "Crystal is used whenever message is automatically translated.",
              )}
            />
          </h2>
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            3 x
            <Crystal className="h-4 w-4" />
          </p>
        </div>
      </div>
    </div>
  );
}
