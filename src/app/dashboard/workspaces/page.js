import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Workspaces");

export default function Page() {
  return <PageContent />;
}
