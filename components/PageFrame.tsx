import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageFrame({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
  return <div className="page-shell"><SiteHeader /><main>{children}</main>{footer && <SiteFooter />}</div>;
}
