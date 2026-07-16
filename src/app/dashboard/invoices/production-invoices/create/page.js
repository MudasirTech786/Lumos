import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Create Production Invoice");

export default function Page() {
  return <PageContent />;
}
