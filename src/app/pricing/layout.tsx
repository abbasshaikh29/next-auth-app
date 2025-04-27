export const metadata = {
  title: 'Pricing - TheTribelab',
  description: 'Simple, transparent pricing for TheTribelab. Build and grow your community for just $39/month.',
}

export default function PricingLayout({
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
