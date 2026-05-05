import Header from '@/app/components/Header'
import InputForm from '@/app/components/InputForm'
import Footer from '@/app/components/Footer'

export const metadata = {
  title: 'Car Recommender | Find Your Perfect Drive',
  description:
    'AI-driven vehicle recommendation based on real-world data and total cost of ownership.',
}

export default function HomePage() {
  return (
    <>
      <Header activePage="compare" />
      <InputForm />
      <Footer />
    </>
  )
}
