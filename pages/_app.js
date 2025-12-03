import '@/styles/globals.css';
import BottomNav from '@/components/ui/BottomNav'

export default function MyApp({ Component, pageProps }) {
  return (
  <>
    <Component {...pageProps} />
    <BottomNav />
  </>
  )
}