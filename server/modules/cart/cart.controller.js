import prisma from '../../config/db.js';

export const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            originalPrice: true,
            images: true,
            stock: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let subtotal = 0;
    const items = cartItems.map((item) => {
      const lineTotal = item.product.price * item.quantity;
      subtotal += lineTotal;
      return {
        ...item,
        lineTotal: parseFloat(lineTotal.toFixed(2)),
        isAvailable: item.product.stock >= item.quantity
      };
    });

    return res.json({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cart items' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity, 10));

    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required.' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`
      });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    let resultItem;
    if (existingCartItem) {
      const newQty = existingCartItem.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${existingCartItem.quantity} in cart and only ${product.stock} are in stock.`
        });
      }

      resultItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQty },
        include: { product: true }
      });
    } else {
      resultItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity: qty
        },
        include: { product: true }
      });
    }

    return res.json({
      success: true,
      message: 'Product added to cart',
      item: resultItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    if (qty > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available stock (${cartItem.product.stock}).`
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: qty },
      include: { product: true }
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ success: false, message: 'Failed to update item quantity' });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id } });
    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    return res.json({ success: true, message: 'Cart cleared successfully.' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
