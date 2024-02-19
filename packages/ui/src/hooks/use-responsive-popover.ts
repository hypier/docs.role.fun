import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTrigger,
} from "../components/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import useMediaQuery from "./use-media-query";

type ResponsivePopoverComponents = {
  Popover: typeof Drawer | typeof Popover;
  PopoverContent: typeof DrawerContent | typeof PopoverContent;
  PopoverTrigger: typeof DrawerTrigger | typeof PopoverTrigger;
  PopoverDescription: typeof DrawerDescription;
  PopoverHeader: typeof DrawerHeader;
  isMobile: boolean;
};

const useResponsivePopover = (): ResponsivePopoverComponents => {
  const { isMobile } = useMediaQuery();

  const Component = isMobile ? Drawer : Popover;
  const ContentComponent = isMobile ? DrawerContent : PopoverContent;
  const TriggerComponent = isMobile ? DrawerTrigger : PopoverTrigger;
  const DescriptionComponent = DrawerDescription;
  const HeaderComponent = DrawerHeader;

  return {
    Popover: Component,
    PopoverContent: ContentComponent,
    PopoverTrigger: TriggerComponent,
    PopoverDescription: DescriptionComponent,
    PopoverHeader: HeaderComponent,
    isMobile,
  };
};

export { useResponsivePopover };
