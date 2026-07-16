import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Employees");

export default function Page() {
  return <PageContent />;
}
