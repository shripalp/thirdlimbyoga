import "./globals.css";

export const metadata = {
  title: "Third Limb Yoga",
  description: "Online and in-person yoga classes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
