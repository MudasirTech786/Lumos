import { cookies } from "next/headers";
import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/production-invoices/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error();
    const json = await res.json();
    const data = json.data || json;
    const number = data.invoice_number || "Invoice";
    return createMetadata(`Invoice ${number} • Print`);
  } catch {
    return createMetadata("Invoice Print");
  }
}

export default function Page() {
  return <PageContent />;
}
