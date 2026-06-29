import Link from 'next/link';
import { Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: { q?: string };
}

const categoryLabels: Record<string, string> = {
  rings: 'Rings',
  earrings: 'Earrings',
  bracelets: 'Bracelets & Bangles',
  solitaires: 'Solitaires',
  mangalsutras: 'Mangalsutras',
  necklaces: 'Necklaces & Pendants',
  silver: 'Silver by Shaya',
  gifting: 'Gifting',
  collections: 'Collections',
  trending: 'Trending',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q ?? '').trim();

  let products: any[] = [];

  if (query) {
    // Search by product name OR by category name match
    const matchedCategories = Object.entries(categoryLabels)
      .filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
      .map(([slug]) => slug);

    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          ...(matchedCategories.length > 0
            ? [{ categoryId: { in: matchedCategories } }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    products = dbProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.basePrice),
      oldPrice: Number(p.basePrice) * 1.15,
      image: '/product_solitaire.png',
      rating: 4.8,
      reviews: 12,
      isNew: true,
      deliveryTime: 'Tomorrow',
      categoryId: p.categoryId,
    }));
  }

  return (
    <>
      <main className="search-page-wrapper">
        <div className="container">

          {/* ── Page heading ── */}
          <div className="search-page-heading">
            <div className="search-page-icon-wrap">
              <Search size={22} color="#C9A96E" />
            </div>
            {query ? (
              <h1 className="search-page-title">
                Results for &ldquo;<span className="search-query-highlight">{query}</span>&rdquo;
              </h1>
            ) : (
              <h1 className="search-page-title">Search Products</h1>
            )}
          </div>

          {/* ── Result count ── */}
          {query && (
            <p className="search-result-count">
              {products.length > 0
                ? `${products.length} product${products.length !== 1 ? 's' : ''} found`
                : 'No products found'}
            </p>
          )}

          {/* ── Product grid ── */}
          {products.length > 0 && (
            <div className="products-grid search-products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          )}

          {/* ── Empty / no-query state ── */}
          {query && products.length === 0 && (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <Search size={48} color="#d4b896" />
              </div>
              <h2 className="search-empty-title">No results for &ldquo;{query}&rdquo;</h2>
              <p className="search-empty-sub">
                Try a different keyword or browse our categories below.
              </p>
              <div className="search-empty-cats">
                {Object.entries(categoryLabels).map(([slug, label]) => (
                  <Link key={slug} href={`/${slug}`} className="mobile-search-chip">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <Search size={48} color="#d4b896" />
              </div>
              <p className="search-empty-sub">
                Start typing to search for rings, earrings, solitaires and more.
              </p>
              <div className="search-empty-cats">
                {Object.entries(categoryLabels).map(([slug, label]) => (
                  <Link key={slug} href={`/${slug}`} className="mobile-search-chip">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
