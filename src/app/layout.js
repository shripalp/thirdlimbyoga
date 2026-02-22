import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "./globals.css";
import Providers from "./providers";


export const metadata = {
  title: "Third Limb Yoga",
  description: "Online and in-person yoga classes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
