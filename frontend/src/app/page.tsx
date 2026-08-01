import React from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import CategoriesGrid from '@/components/CategoriesGrid';
import ProductCard from '@/components/ProductCard';
import AdvantageSection from '@/components/AdvantageSection';
import CollectionsSection from '@/components/CollectionsSection';
import Footer from '@/components/Footer';
import { mockProducts, Product } from '@/data/mockProducts';

// Helper to get mixed products from different categories
const getMixedProducts = (products: Product[], count: number, skip: number = 0) => {
  const mixed: Product[] = [];
  const categories = Array.from(new Set(products.map(p => p.categoryId)));
  let index = skip;
  // Fallback counter to prevent infinite loops just in case
  let loops = 0;
  
  while (mixed.length < count && loops < 100) {
    let addedInThisLoop = false;
    for (const cat of categories) {
      const items = products.filter(p => p.categoryId === cat);
      if (items[index] && mixed.length < count) {
        mixed.push(items[index]);
        addedInThisLoop = true;
      }
    }
    if (!addedInThisLoop) break; // no more items in any category at this index
    index++;
    loops++;
  }
  return mixed;
};

export default function Home() {
  // Use mixed products for Trending & New Arrivals
  const trendingProducts = getMixedProducts(mockProducts, 8, 0);
  const newArrivals = getMixedProducts(mockProducts, 8, 1);
  const weddingProducts = getMixedProducts(mockProducts, 3, 2).map(p => ({ ...p, img: p.image }));

  return (
    <>
      <Header />
      <main>
        <HeroSlider />
        <CategoriesGrid />

        {/* Trending Section */}
        <section id="trending" className="products-section-wrapper">
          <div className="section-title text-center">
            <h2>Trending Designs</h2>
            <p>Popular choices loved by our community. Handpicked just for you.</p>
          </div>
          <div className="products-slider">
            {trendingProducts.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </section>

        <CollectionsSection weddingProducts={weddingProducts} />

        {/* New Arrivals */}
        <section id="arrivals" className="products-section-wrapper">
          <div className="section-title text-center">
            <h2>New Arrivals</h2>
            <p>Be the first to wear our latest, high-fashion styles.</p>
          </div>
          <div className="products-slider">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </section>

        <AdvantageSection />
      </main>
      <Footer />
    </>
  );
}
