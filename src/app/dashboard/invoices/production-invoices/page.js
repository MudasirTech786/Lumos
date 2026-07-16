import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Production Invoices");

export default function Page() {
  return <PageContent />;
}
