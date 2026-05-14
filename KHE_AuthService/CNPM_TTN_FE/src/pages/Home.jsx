import React from 'react';
import Features from '../components/Features';
import Products from '../components/Products';
import Giftsets from '../components/Giftsets';
import Combos from '../components/Combos';
import NewLetter from '../components/NewLetter';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Features />
      <Products />
      <Giftsets />
      <Combos />
      <NewLetter />
    </>
  );
}
