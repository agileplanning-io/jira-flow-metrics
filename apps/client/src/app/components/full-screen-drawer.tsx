import { Drawer, DrawerProps, Layout } from "antd";
import { FC } from "react";

export type FullScreenDrawerProps = Pick<
  DrawerProps,
  "title" | "open" | "onClose" | "children" | "height" | "push"
>;

export const FullScreenDrawer: FC<FullScreenDrawerProps> = ({
  title,
  open,
  onClose,
  children,
  height,
  push,
}) => {
  return (
    <Drawer
      size="large"
      placement="bottom"
      title={title}
      open={open}
      style={{ overflow: "hidden" }}
      height={height ?? "100%"}
      onClose={onClose}
      push={push}
    >
      <Layout style={{ maxWidth: "1440px", margin: "auto" }}>{children}</Layout>
    </Drawer>
  );
};
