import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Crew Assignment");

export default function Page() {
  return <PageContent />;
}
