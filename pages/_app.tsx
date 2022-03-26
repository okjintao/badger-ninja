import { AppProps } from 'next/app'
import NavBar from '../components/NavBar';
import '../styles/globals.css';

function BadgerNinja({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div className="flex flex-col bg-deepsea min-h-screen">
      <NavBar />
      <Component {...pageProps} />
    </div>
  )
}

export default BadgerNinja;
