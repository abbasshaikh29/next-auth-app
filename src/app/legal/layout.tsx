export const metadata = {
  title: 'Legal - TheTribelab',
  description: 'Legal information, terms and conditions, privacy policy, and acceptable use policy for TheTribelab.',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {children}
    </section>
  )
}
