// Clean layout for client sites - no Media4U admin nav, no header/footer
// The template itself provides its own header and footer

export default function ClientSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
