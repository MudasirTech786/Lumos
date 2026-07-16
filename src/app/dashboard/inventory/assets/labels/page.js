import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Asset Labels");

export default function Page() {
  return <PageContent />;
}