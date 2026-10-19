import bcrypt from 'bcryptjs';
import prisma from './config/db.js';

async function main() {
  console.log('--- Starting Database Seed ---');

  // 1. Seed Users (Admin & Customer)
  const hashedAdminPassword = await bcrypt.hash('adminpassword123', 10);
  const hashedCustomerPassword = await bcrypt.hash('customerpassword123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Store Administrator',
      email: 'admin@store.com',
      password: hashedAdminPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✓ Admin user ready: ${admin.email}`);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: {
      name: 'Alex Mercer',
      email: 'customer@store.com',
      password: hashedCustomerPassword,
      role: 'USER'
    }
  });
  console.log(`✓ Demo customer ready: ${customer.email}`);

  // 2. Seed Categories
  const categoriesData = [
    {
      name: 'Smartphones & Tablets',
      slug: 'smartphones',
      description: 'Flagship smartphones, pro tablets, and mobile powerhouses with high refresh OLED displays.',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Laptops & Computers',
      slug: 'laptops',
      description: 'Ultra-thin notebooks, creator workstations, and portable ultrabooks.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Audio & Acoustics',
      slug: 'audio',
      description: 'Studio-grade noise cancelling headphones, audiophile buds, and wireless speakers.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Smart Wearables',
      slug: 'wearables',
      description: 'Precision fitness tracking, cellular smartwatches, and sapphire crystal timepieces.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Gaming & Gear',
      slug: 'gaming',
      description: 'Mechanical tactile keyboards, pro esports mice, and immersive spatial accessories.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image },
      create: cat
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log(`✓ Categories seeded (${Object.keys(categoryMap).length} items)`);

  // 3. Seed Products
  const productsData = [
    {
      name: 'Apex Pro Titanium Smartphone 5G',
      slug: 'apex-pro-titanium-5g',
      description: 'Forged in aerospace-grade grade 5 titanium with an edge-to-edge 6.8-inch Dynamic AMOLED 120Hz display, 200MP periscope zoom camera, and all-day silicon battery.',
      price: 1199.99,
      originalPrice: 1299.99,
      stock: 24,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      rating: 4.9,
      reviewsCount: 142,
      categoryId: categoryMap['smartphones']
    },
    {
      name: 'AeroBook Carbon 14 Ultra',
      slug: 'aerobook-carbon-14-ultra',
      description: 'Featherlight 1.1kg carbon fiber chassis powered by the latest 16-core neural processor, 32GB unified RAM, and 120Hz Liquid Retina display with 22-hour battery stamina.',
      price: 1649.00,
      originalPrice: 1849.00,
      stock: 12,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      rating: 4.8,
      reviewsCount: 89,
      categoryId: categoryMap['laptops']
    },
    {
      name: 'SonicCraft Studio Over-Ear Headphones',
      slug: 'soniccraft-studio-headphones',
      description: 'Active hybrid noise cancellation with custom 45mm neodymium acoustic drivers, lossless LDAC streaming, memory foam ear cups, and 40-hour wireless playtime.',
      price: 299.99,
      originalPrice: 349.99,
      stock: 35,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      rating: 4.9,
      reviewsCount: 215,
      categoryId: categoryMap['audio']
    },
    {
      name: 'ChronoSync Sapphire Smartwatch 2',
      slug: 'chronosync-sapphire-smartwatch',
      description: 'Sculpted sapphire crystal glass over titanium case. Advanced ECG, optical heart rate sensor, VO2 max tracking, 5ATM water resistance, and crisp Always-On display.',
      price: 389.00,
      originalPrice: 429.00,
      stock: 4, // low stock for alert testing
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      rating: 4.7,
      reviewsCount: 96,
      categoryId: categoryMap['wearables']
    },
    {
      name: 'Vortex RGB Mechanical Tenkeyless Keyboard',
      slug: 'vortex-rgb-mechanical-keyboard',
      description: 'Hot-swappable linear optical switches, aircraft-grade aluminum top plate, per-key RGB lighting, PBT double-shot keycaps, and detachable braided USB-C cable.',
      price: 139.50,
      originalPrice: 169.99,
      stock: 18,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      rating: 4.8,
      reviewsCount: 64,
      categoryId: categoryMap['gaming']
    },
    {
      name: 'NovaPulse Wireless Gaming Mouse',
      slug: 'novapulse-wireless-gaming-mouse',
      description: 'Ultra-lightweight 58g honeycomb frame with 26,000 DPI optical sensor, optical micro-switches rated for 80M clicks, and 0.5ms sub-millisecond wireless latency.',
      price: 89.99,
      originalPrice: 109.99,
      stock: 2, // low stock alert
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      rating: 4.6,
      reviewsCount: 77,
      categoryId: categoryMap['gaming']
    },
    {
      name: 'OmniTab Slate 11 Tablet',
      slug: 'omnitab-slate-11',
      description: '11-inch 2.8K 120Hz display with magnetic active stylus support, quad Dolby Atmos speakers, and desktop workstation mode for effortless productivity anywhere.',
      price: 599.00,
      originalPrice: 649.00,
      stock: 15,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: false,
      rating: 4.7,
      reviewsCount: 53,
      categoryId: categoryMap['smartphones']
    },
    {
      name: 'PulseBuds Pro ANC Wireless Earbuds',
      slug: 'pulsebuds-pro-anc',
      description: 'Custom acoustic dual drivers with transparency mode, 6 beamforming microphones for crystal-clear calls, wireless charging case, and IPX7 sweat resistance.',
      price: 179.99,
      originalPrice: 199.99,
      stock: 40,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
      ]),
      featured: true,
      rating: 4.8,
      reviewsCount: 182,
      categoryId: categoryMap['audio']
    }
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod
    });
  }
  console.log(`✓ Products seeded (${productsData.length} items)`);

  // 4. Seed sample order for demo customer
  const firstProduct = await prisma.product.findFirst({ where: { slug: 'apex-pro-titanium-5g' } });
  const secondProduct = await prisma.product.findFirst({ where: { slug: 'pulsebuds-pro-anc' } });

  if (firstProduct && secondProduct) {
    const existingOrder = await prisma.order.findFirst({ where: { userId: customer.id } });
    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-948201-3812',
          userId: customer.id,
          totalAmount: firstProduct.price + secondProduct.price,
          status: 'PROCESSING',
          shippingAddress: JSON.stringify({
            recipientName: 'Alex Mercer',
            phone: '+1 (555) 234-5678',
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            postalCode: '97477',
            country: 'United States'
          }),
          paymentMethod: 'CARD',
          paymentStatus: 'PAID',
          items: {
            create: [
              {
                productId: firstProduct.id,
                quantity: 1,
                price: firstProduct.price
              },
              {
                productId: secondProduct.id,
                quantity: 1,
                price: secondProduct.price
              }
            ]
          }
        }
      });
      console.log(`✓ Seeded sample order ${order.orderNumber} for ${customer.email}`);
    }
  }

  console.log('--- Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
