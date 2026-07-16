import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Employee Payroll");

export default function Page() {
  return <PageContent />;
}
