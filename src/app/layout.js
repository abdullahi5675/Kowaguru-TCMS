import { Outfit } from "next/font/google";
import "./globals.css";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport = {
  themeColor: "#2563eb",
};

export const metadata = {
  title: "Kowaguru TCMS",
  description: "Tailoring Shop Management System",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kowaguru TCMS",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}

