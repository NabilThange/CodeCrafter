export default function VaneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vane-layout">
      {children}
    </div>
  );
}
