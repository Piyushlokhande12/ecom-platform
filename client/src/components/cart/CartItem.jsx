import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  const parseImage = (imagesRaw) => {
    try {
      if (Array.isArray(imagesRaw)) return imagesRaw[0];
      if (typeof imagesRaw === 'string' && imagesRaw.startsWith('[')) {
        return JSON.parse(imagesRaw)[0];
      }
      return imagesRaw || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80';
    }
  };

  const img = parseImage(item.product?.images);
  const isInsufficient = item.product?.stock < item.quantity;

  return (
    <div className="cart-item-row">
      <img
        src={img}
        alt={item.product?.name}
        className="cart-item-thumb"
      />

      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.product?.name}</h4>
        <div className="cart-item-unit-price">
          ${item.product?.price.toFixed(2)} each
        </div>

        {isInsufficient && (
          <span className="cart-stock-warning">
            ⚠️ Only {item.product?.stock} available
          </span>
        )}

        <div className="cart-item-controls">
          <div className="cart-qty-counter">
            <button
              className="cart-qty-btn"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="cart-qty-num">{item.quantity}</span>
            <button
              className="cart-qty-btn"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.product?.stock}
            >
              +
            </button>
          </div>

          <span className="cart-line-total">
            ${(item.product?.price * item.quantity).toFixed(2)}
          </span>

          <button
            className="cart-remove-btn"
            onClick={() => removeItem(item.id)}
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
