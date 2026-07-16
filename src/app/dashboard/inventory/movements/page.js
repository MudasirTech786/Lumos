import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Inventory Movements");

export default function Page() {
  return <PageContent />;
}