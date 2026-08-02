import "./globals.css";

export const metadata = {
  title: "SMTP Manager",
  description: "Manage sending domains, DNS records and SMTP credentials",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
