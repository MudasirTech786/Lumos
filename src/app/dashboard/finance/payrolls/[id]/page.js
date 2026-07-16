import { cookies } from "next/headers";
import { createMetadata } from "@/lib/metadata";
import PageContent from "./PageContent";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payrolls/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const reference = data.reference || "Payroll";
    return createMetadata(reference);
  } catch {
    return createMetadata("Payroll Details");
  }
}

export default function Page() {
  return <PageContent />;
}
