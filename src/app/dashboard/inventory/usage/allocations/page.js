import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Equipment Allocations");

export default function Page() {
  return <PageContent />;
}