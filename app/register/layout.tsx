export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      {children}
    </main>
  )
}