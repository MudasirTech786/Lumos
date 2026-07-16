import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import QueryProvider from "./QueryProvider";

export const metadata = {
  title: {
    default: "LUMOS",
    template: "LUMOS | %s",
  },
  description: "Production, Crew, Equipment & Finance Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <QueryProvider>
          <AuthProvider>
            <ConfirmProvider>
              {children}
              <Toaster position="top-right" />
            </ConfirmProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}