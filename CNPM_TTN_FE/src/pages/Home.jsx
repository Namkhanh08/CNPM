import React from 'react';
import Features from '../components/Features';
import Products from '../components/Products';
import Giftsets from '../components/Giftsets';
import Combos from '../components/Combos';
import NewLetter from '../components/NewLetter';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <Features />
      <Products />
      <Giftsets />
      <Combos />
      <NewLetter />
    </>
  );
}
