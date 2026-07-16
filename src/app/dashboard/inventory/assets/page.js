import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Inventory Assets");

export default function Page() {
  return <PageContent />;
}
