import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Create Account");

export default function Page() {
  return <PageContent />;
}
