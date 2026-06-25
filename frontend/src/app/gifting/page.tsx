import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function GiftingPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'gifting' },
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
      categoryName="Gifting"
      categorySlug="gifting"
      breadcrumb={['Jewellery']}
      subtitle="The perfect jewellery gift for every occasion — anniversary, birthday, festivals & more"
      bannerImage="/polki_banner.png"
      products={products}
      filters={giftFilters}
    />
  );
}
