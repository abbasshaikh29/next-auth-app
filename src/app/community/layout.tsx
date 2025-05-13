export const metadata = {
  title: 'Community - TheTribelab',
  description: 'Join our community to connect with other members and get the most out of TheTribelab.',
}

export default function CommunityLayout({
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
