import React from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import CategoriesGrid from '@/components/CategoriesGrid';
import ProductCard from '@/components/ProductCard';
import AdvantageSection from '@/components/AdvantageSection';
import CollectionsSection from '@/components/CollectionsSection';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure we fetch fresh data from the database

export default async function Home() {
  // Fetch up to 10 active products from the shared database
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  // Map database products to the frontend component format
  // We use fallback images and ratings since they are not in the core Product schema yet
  const formattedProducts = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.basePrice),
    oldPrice: Number(p.basePrice) * 1.15, // Example fallback calculation
    image: '/product_solitaire.png', // Fallback image
    img: '/product_solitaire.png', // Fallback image for CollectionsSection
    rating: 4.8,
    reviews: 12,
    deliveryTime: 'Tomorrow',
    isNew: true
  }));

  // Split into Trending and New Arrivals
  const trendingProducts = formattedProducts.slice(0, 5);
  const newArrivals = formattedProducts.slice(5, 10);
  const weddingProducts = formattedProducts.slice(0, 3); // For the collections section

  return (
    <>
      <Header />

      <main>
        {/* Full-width Hero Banner Slider */}
        <HeroSlider />

        {/* Full-width Categories Panel */}
        <CategoriesGrid />

        {/* Trending Section — full width */}
        <section id="trending" className="products-section-wrapper">
          <div className="section-title text-center">
            <h2>Trending Designs</h2>
            <p>Popular choices loved by our community. Handpicked just for you.</p>
          </div>
          <div className="products-grid">
            {trendingProducts.length > 0 ? (
              trendingProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>
                No trending products available. Add some from the Admin Portal!
              </p>
            )}
          </div>
        </section>

        {/* Curated Banners & Collections — full width */}
        <CollectionsSection weddingProducts={weddingProducts} />

        {/* New Arrivals Section — full width */}
        <section id="rings" className="products-section-wrapper">
          <div className="section-title text-center">
            <h2>New Arrivals</h2>
            <p>Be the first to wear our latest, high-fashion styles.</p>
          </div>
          <div className="products-grid">
            {newArrivals.length > 0 ? (
              newArrivals.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>
                No new arrivals available. Add some from the Admin Portal!
              </p>
            )}
          </div>
        </section>

        {/* Core Values / Advantage Section — full width */}
        <AdvantageSection />
      </main>

      <Footer />
    </>
  );
}
