import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Notifications");

export default function Page() {
  return <PageContent />;
}
