import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Active Usage");

export default function Page() {
  return <PageContent />;
}