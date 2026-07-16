import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Leaves");

export default function Page() {
  return <PageContent />;
}
