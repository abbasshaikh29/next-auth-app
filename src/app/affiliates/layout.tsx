export const metadata = {
  title: 'Affiliates - TheTribelab',
  description: 'Join our affiliate program and earn rewards for referring new members to TheTribelab.',
}

export default function AffiliatesLayout({
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
