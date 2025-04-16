export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-12 items-center flex-1 w-full justify-center">
      {children}
    </div>
  );
}
