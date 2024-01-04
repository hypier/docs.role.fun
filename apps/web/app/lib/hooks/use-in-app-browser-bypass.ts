import { useEffect } from "react";

export const useInAppBrowserBypassing = () => {
  useEffect(() => {
    if (window.location && navigator) {
      let location = window.location;

      const useragt = navigator.userAgent.toLowerCase();

      const target_url = location.href;

      if (useragt.match(/kakaotalk/i)) {
        location.href =
          "kakaotalk://web/openExternal?url=" + encodeURIComponent(target_url);
      } else if (useragt.match(/line/i)) {
        if (target_url.indexOf("?") !== -1) {
          location.href = target_url + "&openExternalBrowser=1";
        } else {
          location.href = target_url + "?openExternalBrowser=1";
        }
      } else if (
        useragt.match(
          /inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|SamsungBrowser\/[^1]/i
        )
      ) {
      }
    }
  }, []);
};
