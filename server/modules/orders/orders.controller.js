import prisma from '../../config/db.js';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Place Order (Checkout)
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'CARD', items: directItems } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    let orderItemsData = [];

    // Direct items (e.g., "Buy Now" flow)
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      for (const item of directItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
          });
        }
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          product
        });
      }
    } else {
      // Pull from cart
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: req.user.id },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty.' });
      }

      for (const cartItem of cartItems) {
        if (cartItem.product.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${cartItem.product.name}". Available: ${cartItem.product.stock}`
          });
        }
        orderItemsData.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          product: cartItem.product
        });
      }
    }

    const totalAmount = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          status: 'PENDING',
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true, price: true }
              }
            }
          }
        }
      });

      // 2. Decrement stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 3. Clear cart if checking out from cart
      if (!directItems || directItems.length === 0) {
        await tx.cartItem.deleteMany({
          where: { userId: req.user.id }
        });
      }

      return order;
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ success: false, message: 'Failed to process order', error: error.message });
  }
};

// Customer's order history
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order history' });
  }
};

// Single order lookup
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// Admin: Get all orders with filter and search
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status && status !== 'ALL' && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
        { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
        { user: { email: { contains: search.trim(), mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Admin: Update order status (Order status management)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Handle inventory adjustments if order is cancelled or restored
    if (order.status !== 'CANCELLED' && status === 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
        await tx.order.update({
          where: { id },
          data: { status }
        });
      });
    } else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
        await tx.order.update({
          where: { id },
          data: { status }
        });
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: { status }
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true } }
          }
        }
      }
    });

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// Admin: KPI Statistics
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalOrders,
      ordersByStatus,
      products,
      totalUsers,
      recentOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { totalAmount: true }
      }),
      prisma.product.findMany({
        select: { id: true, stock: true, price: true }
      }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } }
        }
      })
    ]);

    let totalRevenue = 0;
    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    ordersByStatus.forEach((group) => {
      statusCounts[group.status] = group._count.status;
      if (group.status !== 'CANCELLED') {
        totalRevenue += group._sum.totalAmount || 0;
      }
    });

    const totalProducts = products.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      if (p.stock === 0) outOfStockCount++;
      else if (p.stock <= 5) lowStockCount++;
    });

    return res.json({
      revenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      statusCounts,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalUsers,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};
