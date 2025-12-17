"use client";

import * as React from "react";
import { cva } from "class-variance-authority@0.7.1";

import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import { TooltipContent } from "./tooltip";
import { cn } from "./utils";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const nextValue =
        typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(nextValue);
      } else {
        _setOpen(nextValue);
      }
      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextValue ? "expanded" : "collapsed"}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-sidebar="provider"
        data-state={state}
        className={cn("flex min-h-screen", className)}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-sidebar="sidebar"
        data-side={side}
        data-variant={variant}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full w-[--sidebar-width] flex-col border-r",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        data-sidebar="sidebar"
        data-side={side}
        data-variant={variant}
        data-state={openMobile ? "open" : "closed"}
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 z-40 flex w-[--sidebar-width-mobile] flex-col border-r transition-transform",
          openMobile ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-sidebar="sidebar"
      data-side={side}
      data-variant={variant}
      data-state={state}
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full flex-col border-r transition-[width]",
        state === "expanded" ? "w-[--sidebar-width]" : "w-[--sidebar-width-icon]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      size="icon"
      variant="ghost"
      className={cn("h-8 w-8", className)}
      onClick={(event) => {
        toggleSidebar();
        onClick?.(event);
      }}
      {...props}
    />
  );
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      data-sidebar="rail"
      onClick={toggleSidebar}
      className={cn(
        "hover:bg-sidebar-accent absolute inset-y-0 w-1 cursor-ew-resize border-r border-transparent",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }) {
  return (
    <main
      data-sidebar="inset"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

function SidebarInput({ className, ...props }) {
  return (
    <Input
      data-sidebar="input"
      className={cn("h-8", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }) {
  return (
    <Separator
      data-sidebar="separator"
      className={cn("my-2", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }) {
  return (
    <div
      data-sidebar="content"
      className={cn("flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-sidebar="group"
      className={cn("flex flex-col gap-1 p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({ className, asChild = false, ...props }) {
  const Comp = asChild ? React.Fragment : "div";
  return (
    <Comp
      data-sidebar="group-label"
      className={cn("px-2 text-xs font-semibold text-muted-foreground", className)}
      {...(!asChild ? props : {})}
    />
  );
}

function SidebarGroupAction({ className, asChild = false, ...props }) {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Comp
      data-sidebar="group-action"
      className={cn(
        "hover:bg-sidebar-accent focus-visible:ring-sidebar-ring ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-xs outline-none focus-visible:ring-2",
        className,
      )}
      {...(!asChild ? props : {})}
    />
  );
}

function SidebarGroupContent({ className, ...props }) {
  return (
    <div
      data-sidebar="group-content"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-sidebar="menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? React.Fragment : "button";
  const content = (
    <Comp
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        className,
      )}
      {...(!asChild ? props : {})}
    />
  );

  if (!tooltip) return content;

  return (
    <div className="relative flex items-center">
      {content}
      {typeof tooltip === "string" ? (
        <TooltipContent>{tooltip}</TooltipContent>
      ) : (
        tooltip
      )}
    </div>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Comp
      data-sidebar="menu-action"
      className={cn(
        "hover:bg-sidebar-accent focus-visible:ring-sidebar-ring absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md text-xs outline-none focus-visible:ring-2",
        showOnHover &&
          "opacity-0 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100",
        className,
      )}
      {...(!asChild ? props : {})}
    />
  );
}

function SidebarMenuBadge({ className, ...props }) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "bg-sidebar-accent text-sidebar-accent-foreground ml-auto flex h-5 items-center rounded-full px-2 text-[0.7rem] font-medium",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({ className, showIcon = false, ...props }) {
  return (
    <div
      data-sidebar="menu-skeleton"
      className={cn("flex items-center gap-2 p-2", className)}
      {...props}
    >
      {showIcon && <div className="bg-sidebar-border h-4 w-4 rounded" />}
      <div className="bg-sidebar-border h-4 flex-1 rounded" />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }) {
  return (
    <ul
      data-sidebar="menu-sub"
      className={cn("ml-4 flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }) {
  return (
    <li
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? React.Fragment : "a";
  return (
    <Comp
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs outline-none focus-visible:ring-2",
        size === "sm" ? "h-7" : "h-8",
        isActive &&
          "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        className,
      )}
      {...(!asChild ? props : {})}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
