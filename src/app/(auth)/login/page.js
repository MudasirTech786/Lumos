import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Login");

export default function Page() {
  return <PageContent />;
}
