import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Stock Levels");

export default function Page() {
  return <PageContent />;
}