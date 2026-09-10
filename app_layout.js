import "./globals.css";

export const metadata = {
  title: "Transport Coordination System",
  description: "Employee transport signup, vendor boarding, and admin reporting"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}