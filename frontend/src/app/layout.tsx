import type { Metadata } from "next";
import "./globals.css";
import Preloader from "../components/Preloader";

export const metadata: Metadata = {
  title: "Nakshathra Gold and Diamonds | Best Store for Online Jewellery Shopping",
  description: "Nakshathra Gold and Diamonds offers the best gold & diamond jewellery designs online. Check out our latest collection of rings, earrings, bangles, bracelets, necklaces at best price in India.",
  keywords: "jewellery, gold, diamond, rings, earrings, bangles, necklaces, online jewellery, nakshathra gold and diamonds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
