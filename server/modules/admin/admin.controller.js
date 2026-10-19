import prisma from '../../config/db.js';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// KPI Statistics
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

// All Orders with Filter & Search
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

// Update Order Status
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

// Customer accounts directory
export const getAdminCustomers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map((u) => {
      const totalSpent = u.orders.reduce(
        (sum, o) => (o.status !== 'CANCELLED' ? sum + o.totalAmount : sum),
        0
      );
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        ordersCount: u.orders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer list' });
  }
};
