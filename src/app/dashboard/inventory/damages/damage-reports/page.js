import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Damage Reports");

export default function Page() {
  return <PageContent />;
}