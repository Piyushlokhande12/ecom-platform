import prisma from '../../config/db.js';
import { generateSlug } from '../../utils/slug.js';

export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, featured, minPrice, maxPrice } = req.query;

    const where = {};

    if (category && category !== 'all') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } }
      ];
    }

    if (search && search.trim() !== '') {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'name-asc') orderBy = { name: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      stock,
      images,
      categoryId,
      featured,
      rating
    } = req.body;

    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price, and categoryId are required.' });
    }

    const uniqueSlug = slug ? generateSlug(slug) : `${generateSlug(name)}-${Date.now()}`;

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Selected category does not exist.' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock, 10) || 0,
        images: typeof images === 'object' ? JSON.stringify(images) : (images || '[]'),
        categoryId,
        featured: Boolean(featured),
        rating: rating ? parseFloat(rating) : 4.8
      },
      include: {
        category: true
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      stock,
      images,
      categoryId,
      featured,
      rating
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: generateSlug(slug) }),
        ...(description !== undefined && { description: description?.trim() || '' }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(images !== undefined && { images: typeof images === 'object' ? JSON.stringify(images) : images }),
        ...(categoryId && { categoryId }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(rating !== undefined && { rating: parseFloat(rating) })
      },
      include: {
        category: true
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product removed successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
