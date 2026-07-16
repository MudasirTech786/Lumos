import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export const metadata = createMetadata("Barcode Scanner");

export default function Page() {
  return <PageContent />;
}