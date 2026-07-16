import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Finance Dashboard");

export default function Page() {
  return <PageContent />;
}
