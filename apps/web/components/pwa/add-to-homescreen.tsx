import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useUserAgent from "../../app/lib/hooks/use-user-agents";
import { useLocalStorage } from "@uidotdev/usehooks";

const ModuleLoading = () => (
  <p className="animate-bounce font-bold text-foreground">Loading...</p>
);
const AddToIosSafari = dynamic(() => import("./AddToIosSafari"), {
  loading: () => <ModuleLoading />,
});
const AddToMobileChrome = dynamic(() => import("./AddToMobileChrome"), {
  loading: () => <ModuleLoading />,
});
const AddToMobileFirefox = dynamic(() => import("./AddToMobileFirefox"), {
  loading: () => <ModuleLoading />,
});
const AddToMobileFirefoxIos = dynamic(() => import("./AddToMobileFirefoxIos"), {
  loading: () => <ModuleLoading />,
});
const AddToMobileChromeIos = dynamic(() => import("./AddToMobileChromeIos"), {
  loading: () => <ModuleLoading />,
});
const AddToSamsung = dynamic(() => import("./AddToSamsung"), {
  loading: () => <ModuleLoading />,
});
const AddToOtherBrowser = dynamic(() => import("./AddToOtherBrowser"), {
  loading: () => <ModuleLoading />,
});

type AddToHomeScreenPromptType =
  | "safari"
  | "chrome"
  | "firefox"
  | "other"
  | "firefoxIos"
  | "chromeIos"
  | "samsung"
  | "";
const COOKIE_NAME = "addToHomeScreenPrompt";

export default function AddToHomeScreen() {
  const [displayPrompt, setDisplayPrompt] =
    useState<AddToHomeScreenPromptType>("");
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();
  const [promptShown, setPromptShown] = useLocalStorage(
    "install-prompt",
    false,
  );

  const closePrompt = () => {
    setDisplayPrompt("");
  };

  const doNotShowAgain = () => {
    // Create date 1 year from now
    setPromptShown(true);
    setDisplayPrompt("");
  };

  useEffect(() => {
    const addToHomeScreenPromptCookie = promptShown;

    if (!addToHomeScreenPromptCookie) {
      // Only show prompt if user is on mobile and app is not installed
      if (isMobile && !isStandalone) {
        if (userAgent === "Safari") {
          setDisplayPrompt("safari");
        } else if (userAgent === "Chrome") {
          setDisplayPrompt("chrome");
        } else if (userAgent === "Firefox") {
          setDisplayPrompt("firefox");
        } else if (userAgent === "FirefoxiOS") {
          setDisplayPrompt("firefoxIos");
        } else if (userAgent === "ChromeiOS") {
          setDisplayPrompt("chromeIos");
        } else if (userAgent === "SamsungBrowser") {
          setDisplayPrompt("samsung");
        } else {
          setDisplayPrompt("other");
        }
      }
    } else {
    }
  }, [userAgent, isMobile, isStandalone, isIOS]);

  const Prompt = () => (
    <>
      {
        {
          safari: (
            <AddToIosSafari
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          chrome: (
            <AddToMobileChrome
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          firefox: (
            <AddToMobileFirefox
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          firefoxIos: (
            <AddToMobileFirefoxIos
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          chromeIos: (
            <AddToMobileChromeIos
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          samsung: (
            <AddToSamsung
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          other: (
            <AddToOtherBrowser
              closePrompt={closePrompt}
              doNotShowAgain={doNotShowAgain}
            />
          ),
          "": <></>,
        }[displayPrompt]
      }
    </>
  );

  return (
    <>
      {displayPrompt !== "" ? (
        <>
          <div
            className="fixed bottom-0 left-0 right-0 top-0 z-50 bg-black/70"
            onClick={closePrompt}
          >
            <Prompt />
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
