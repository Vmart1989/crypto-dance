
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';



export const metadata = {
  title: "CryptoDance",
  description: "Simulate trading and learn the basics of cryptocurrency",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body>
      {children}
    </body>
  </html>
  );
}
