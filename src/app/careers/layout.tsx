export const metadata = {
  title: 'Careers - TheTribelab',
  description: 'Join our team and help us build the future of community platforms.',
}

export default function CareersLayout({
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
