import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Repairs");

export default function Page() {
  return <PageContent />;
}