import { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import NavBar from '../components/NavBar';
import { getLibrary } from '../config/web3/library.config';
import { Web3ReactProvider } from '@web3-react/core';
import getStore from '../store';
import { StoreProvider } from '../store/StoreContext';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function BadgerNinja({ Component, pageProps }: AppProps): JSX.Element {
  const store = getStore();

  useEffect(() => {
    async function updateApp() {
      await store.updateData();
    }
    updateApp();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <meta key="twitter:card" name="twitter:card" content="app" />
        <meta key="twitter:title" name="twitter:title" content="Badger Ninja" />
        <meta
          key="twitter:url"
          name="twitter:url"
          content="https://badger-ninja.vercel.app/"
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Badger DAO Vault Analytics"
        />
        <meta
          key="twitter:image"
          name="twitter:image"
          content="https://app.badger.com/assets/icons/badger_head.svg"
        />
        <meta
          key="twitter:creator"
          name="twitter:creator"
          content="@BadgerDAO"
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:site_name"
          property="og:site_name"
          content="Badger Ninja"
        />
        <meta
          key="og:url"
          property="og:url"
          content="https://badger-ninja.vercel.app/"
        />
        <meta
          key="og:image"
          property="og:image"
          content="https://app.badger.com/assets/icons/badger_head.svg"
        />
        <meta
          key="og:description"
          property="og:description"
          content="Badger DAO Vault Analytics"
        />
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <StoreProvider value={store}>
          <div className="flex flex-col bg-cave min-h-screen">
            <NavBar />
            <Component {...pageProps} />
            <ToastContainer
              position="bottom-right"
              newestOnTop={true}
              closeOnClick
              theme="dark"
              draggable
            />
          </div>
        </StoreProvider>
      </Web3ReactProvider>
    </>
  );
}

export default BadgerNinja;
