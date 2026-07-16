import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Roles");

export default function Page() {
  return <PageContent />;
}
