export const metadata = {
  title: 'Support - TheTribelab',
  description: 'Get help and support for your TheTribelab account and communities.',
}

export default function SupportLayout({
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
