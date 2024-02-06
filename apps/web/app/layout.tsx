import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { calSans, inter } from "./fonts";
import { Providers } from "./providers";
import NavBar from "./navbar";
import { constructMetadata } from "./lib/utils";
import Footer from "./footer";
import TabsController from "./tabs-controller";
import { Suspense } from "react";
import Spinner from "@repo/ui/src/components/spinner";
import dynamic from "next/dynamic";

export const metadata = constructMetadata();
const Pageview = dynamic(() => import("./pageview"), {
  ssr: false,
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0;"
      />
      <body className={cx(calSans.variable, inter.variable)}>
        <Suspense fallback={<Spinner />}>
          <Providers>
            <NavBar />
            <main className="flex w-full pt-16 font-default lg:pt-24">
              <TabsController />
              {children}
              <Pageview />
            </main>
            <Footer />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
