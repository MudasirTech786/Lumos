import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("New Production");

export default function Page() {
  return <PageContent />;
}
