import prisma from '../../config/db.js';
import { generateSlug } from '../../utils/slug.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const categorySlug = slug ? generateSlug(slug) : generateSlug(name);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: categorySlug }]
      }
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Category already exists with this name or slug.' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: categorySlug,
        description: description?.trim() || null,
        image: image?.trim() || null
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, slug } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug ? { slug: generateSlug(slug) } : (name ? { slug: generateSlug(name) } : {})),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(image !== undefined && { image: image?.trim() || null })
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};
