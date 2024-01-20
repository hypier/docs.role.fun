import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "./dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTrigger,
} from "./drawer";
import useMediaQuery from "../hooks/use-media-query";

const DialogOrDrawer: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const { isMobile } = useMediaQuery();
  return isMobile ? <Drawer {...props} /> : <Dialog {...props} />;
};

const DialogOrDrawerContent: React.FC<React.PropsWithChildren<{}>> = (
  props
) => {
  const { isMobile } = useMediaQuery();
  return isMobile ? <DrawerContent {...props} /> : <DialogContent {...props} />;
};

const DialogOrDrawerDescription: React.FC<React.PropsWithChildren<{}>> = (
  props
) => {
  const { isMobile } = useMediaQuery();
  return isMobile ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  );
};

const DialogOrDrawerHeader: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const { isMobile } = useMediaQuery();
  return isMobile ? <DrawerHeader {...props} /> : <DialogHeader {...props} />;
};

const DialogOrDrawerTrigger: React.FC<React.PropsWithChildren<{}>> = (
  props
) => {
  const { isMobile } = useMediaQuery();
  return isMobile ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />;
};

export {
  DialogOrDrawer,
  DialogOrDrawerContent,
  DialogOrDrawerDescription,
  DialogOrDrawerHeader,
  DialogOrDrawerTrigger,
};
