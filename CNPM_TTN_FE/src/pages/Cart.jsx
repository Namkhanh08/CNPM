import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { getImageUrl, handleImageError } from '../utils/imageUrl';

const getCartItem = (item) => {
  const product = item.Product ?? item.product ?? {};

  return {
    id: item.Id ?? item.id,
    productId: item.ProductId ?? item.productId ?? product.Id ?? product.id,
    grindingOptionId: item.GrindingOptionId ?? item.grindingOptionId,
    flavorNotes: item.FlavorNotes ?? item.flavorNotes ?? 'Original',
    weight: item.Weight ?? item.weight ?? '250g',
    quantity: item.Quantity ?? item.quantity ?? 1,
    selected: item.selected ?? true,
    product: {
      id: product.Id ?? product.id,
      name: product.Name ?? product.name ?? 'San pham',
      price: Number(product.Price ?? product.price ?? 0),
      imageUrl: product.ImageUrl ?? product.imageUrl,
    },
  };
};

export default function Cart() {
  const navigate = useNavigate();

  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const loadCart = useStore((state) => state.loadCart);
  const toggleSelected = useStore((state) => state.toggleSelected);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCart();
    }
  }, [loadCart]);

  const normalizedCart = cart.map(getCartItem);
  const selectedItems = normalizedCart.filter((item) => item.selected);
  const hasSelectedItems = selectedItems.length > 0;
  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item.id);
      alert(`Da xoa san pham ${item.product.name} khoi gio hang!`);
    } catch (err) {
      console.error('Remove item failed:', err);
      alert('Khong the xoa san pham. Vui long thu lai.');
    }
  };

  const translateGrind = (type) => {
    switch (Number(type)) {
      case 1: return 'Nguyen Hat';
      case 2: return 'Phan Phin';
      case 3: return 'Pha May';
      case 4: return 'U Lanh';
      case 5: return 'Kieu Phap';
      default: return type || 'Mac dinh';
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-6 pb-20">
        <h2 className="font-nunito font-bold text-4xl text-primary mb-4 text-center">
          GIO HANG CUA BAN DANG TRONG
        </h2>
        <p className="font-nunito text-accent-1 text-base mb-8 max-w-md text-center">
          Hay kham pha them cac san pham ca phe hoac thu cac goi subscription cua chung toi.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center bg-primary text-white font-nunito font-bold py-4 rounded-full px-10 hover:bg-accent-1 hover:text-white hover:-translate-y-1 transition-all duration-300 hover:scale-105"
        >
          DI DEN CUA HANG
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary font-nunito font-bold mb-8 hover:text-accent-1 transition-colors"
        >
          <ArrowLeft size={20} /> Quay lai
        </button>

        <h1 className="font-nunito font-bold text-5xl text-primary mb-10">GIO HANG</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 bg-white rounded-3xl p-6 md:p-10 shadow-lg">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 font-montserrat font-bold text-sm text-primary/60 uppercase tracking-widest mb-6">
              <div className="col-span-6 text-accent-1">San pham</div>
              <div className="col-span-2 text-center text-accent-1">Don gia</div>
              <div className="col-span-2 text-center text-accent-1">So luong</div>
              <div className="col-span-2 text-right text-accent-1">Tong</div>
            </div>

            <div className="space-y-8">
              {normalizedCart.map((item) => (
                <div
                  key={`${item.id}-${item.grindingOptionId}-${item.flavorNotes}-${item.weight}`}
                  className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center pb-8 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="col-span-6 w-full flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelected(
                        item.productId,
                        item.grindingOptionId,
                        item.flavorNotes,
                        item.weight
                      )}
                    />
                    <div className="w-24 h-24 bg-pinky-gray rounded-2xl p-2 flex shrink-0">
                      <img
                        src={getImageUrl(item.product.imageUrl)}
                        onError={handleImageError}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col flex-1 text-left">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-montserrat font-bold text-xl text-primary hover:text-accent-1 mb-1 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <span className="font-nunito text-primary/60 text-sm mb-2">
                        Kieu xay: <strong className="text-primary">{translateGrind(item.grindingOptionId)}</strong>
                      </span>
                      <span className="font-nunito text-primary/60 text-sm mb-2">
                        Vi: <strong className="text-primary">{item.flavorNotes}</strong>
                      </span>
                      <span className="font-nunito text-primary/60 text-sm mb-2">
                        Khoi luong: <strong className="text-primary">{item.weight}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 font-nunito text-sm w-fit"
                      >
                        <Trash2 size={16} /> Bo phan nay
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 w-full flex md:justify-center justify-between items-center mt-4 md:mt-0 font-montserrat font-bold text-primary/80">
                    <span className="md:hidden font-nunito text-sm text-primary/60">Don gia:</span>
                    {item.product.price.toLocaleString('vi-VN')}d
                  </div>

                  <div className="col-span-2 w-full flex md:justify-center justify-between items-center font-montserrat">
                    <span className="md:hidden font-nunito text-sm text-primary/60">So luong:</span>
                    <div className="flex items-center border border-gray-200 rounded-full bg-white px-1 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-primary/50 hover:bg-pinky-gray"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-primary/50 hover:bg-pinky-gray"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 w-full flex md:justify-end justify-between items-center font-montserrat font-black text-primary text-base">
                    <span className="md:hidden font-nunito text-xs text-primary/60 font-bold">Thanh tien:</span>
                    {(item.product.price * item.quantity).toLocaleString('vi-VN')}d
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl p-8 shadow-lg sticky top-4">
              <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4">
                Tong cong gio hang
              </h2>

              <div className="space-y-4 mb-6 font-nunito">
                <div className="flex justify-between items-center text-primary/80">
                  <span>Tam tinh</span>
                  <span className="font-bold">{totalPrice.toLocaleString('vi-VN')}d</span>
                </div>
                <div className="flex justify-between items-center text-primary/80 pb-4 border-b border-gray-100">
                  <span>Phi giao hang</span>
                  <span className="italic text-sm text-primary/60">Tinh o buoc thanh toan</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-montserrat font-bold text-lg text-primary">Tong cong</span>
                  <span className="font-montserrat font-black text-3xl text-red-custom">
                    {totalPrice.toLocaleString('vi-VN')}d
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={!hasSelectedItems}
                className={`w-full font-nunito font-bold py-4 rounded-full text-lg uppercase tracking-wider block text-center transition-all duration-300 ${
                  hasSelectedItems
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-accent-1 hover:-translate-y-1 hover:scale-105'
                    : 'bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed shadow-none'
                }`}
              >
                Tien hanh thanh toan
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 bg-white/50 border border-white p-6 rounded-3xl text-sm font-nunito text-primary/70 shadow-lg">
              <p>Ca phe rang tuoi moi ngay, giao hang nhanh chong.</p>
              <p>Ho tro doi tra trong 7 ngay neu khong hai long vi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
