import prisma from '../../config/db.js';

export const getInventoryOverview = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        images: true,
        category: {
          select: { id: true, name: true }
        },
        updatedAt: true
      },
      orderBy: { stock: 'asc' }
    });

    const totalProducts = products.length;
    let totalStockUnits = 0;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const items = products.map((item) => {
      totalStockUnits += item.stock;
      totalStockValue += item.stock * item.price;

      let status = 'IN_STOCK';
      if (item.stock === 0) {
        status = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (item.stock <= 5) {
        status = 'LOW_STOCK';
        lowStockCount++;
      }

      return {
        ...item,
        status,
        inventoryValue: parseFloat((item.stock * item.price).toFixed(2))
      };
    });

    return res.json({
      summary: {
        totalProducts,
        totalStockUnits,
        totalStockValue: parseFloat(totalStockValue.toFixed(2)),
        lowStockCount,
        outOfStockCount
      },
      items
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory overview' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, stock: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let newStock = existing.stock;
    if (stock !== undefined) {
      newStock = Math.max(0, parseInt(stock, 10));
    } else if (delta !== undefined) {
      newStock = Math.max(0, existing.stock + parseInt(delta, 10));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
      select: { id: true, name: true, stock: true, updatedAt: true }
    });

    return res.json({
      success: true,
      message: `Stock updated for ${updated.name}`,
      product: updated
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
};
