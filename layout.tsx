import './globals.css';

export const metadata = {
  title: 'ScriptGen App',
  description: 'AI Video Script Generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
