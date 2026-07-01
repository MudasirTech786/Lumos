import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import QueryProvider from "./QueryProvider";

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