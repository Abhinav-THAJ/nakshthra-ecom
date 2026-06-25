import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BraceletsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'bracelets' },
    orderBy: { createdAt: 'desc' }
  });
  
  const products = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.basePrice),
    oldPrice: Number(p.basePrice) * 1.15,
    image: '/product_solitaire.png',
    rating: 4.8,
    reviews: 12,
    isNew: true,
    deliveryTime: 'Tomorrow'
  }));

  return (
    <CategoryPageTemplate
      categoryName="Bracelets & Bangles"
      categorySlug="bracelets"
      breadcrumb={['Jewellery']}
      subtitle="From delicate chains to bridal bangles — crafted in gold, diamond & platinum"
      bannerImage="/product_bracelet.png"
      products={products}
    />
  );
}
