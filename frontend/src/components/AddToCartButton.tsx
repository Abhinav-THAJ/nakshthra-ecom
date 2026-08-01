'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
  id: string;
  name: string;
  code: string;
  price: number;
  oldPrice?: number;
  image: string;
  weight?: string;
  diamondCt?: string;
}

export default function AddToCartButton(props: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(props);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      className={`btn-add-cart ${added ? 'btn-added' : ''}`}
      onClick={handleAdd}
    >
      {added ? (
        <><Check size={16} /> Added!</>
      ) : (
        <><ShoppingCart size={16} /> Add to Cart</>
      )}
    </button>
  );
}
