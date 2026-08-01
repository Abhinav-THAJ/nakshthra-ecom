import { mockProducts } from '@/data/mockProducts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';
import { Star, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = mockProducts.find(p => p.id === id);

  if (!product) notFound();

  const similarProducts = mockProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 8);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return (
    <>
      <Header />
      <div className="product-details-page">
        <div className="container product-details-container">

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span> › </span>
            <Link href={`/${product.categoryId}`}>
              {product.categoryId.charAt(0).toUpperCase() + product.categoryId.slice(1)}
            </Link>
            <span> › </span>
            <span className="current">{product.name}</span>
          </div>

          <div className="product-grid">
            {/* Left: Interactive Image Gallery */}
            <ProductGallery images={images} name={product.name} />

            {/* Right: Details */}
            <div className="product-info-panel">
              <h1 className="product-title-large">{product.description || product.name}</h1>
              <p className="product-code">Product Code: {product.code}</p>

              <div className="rating-row flex">
                <div className="rating-box flex-center">
                  <span>{(product.rating || 4.8).toFixed(1)}</span>
                  <Star size={12} fill="#ffb300" color="#ffb300" />
                </div>
                <span className="reviews-text">({product.reviews || 12} reviews)</span>
              </div>

              <div className="price-section">
                <span className="current-price-large">₹{product.price.toLocaleString('en-IN')}</span>
                {product.oldPrice && (
                  <span className="old-price-large">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                )}
                {discount > 0 && (
                  <span className="discount-large">({discount}% OFF)</span>
                )}
              </div>
              <p className="tax-inclusive">Inclusive of all taxes</p>

              {/* Attributes */}
              <div className="attributes-grid">
                {product.weight && (
                  <div className="attr-item">
                    <span className="attr-label">Weight</span>
                    <span className="attr-value">{product.weight}</span>
                  </div>
                )}
                {product.diamondCt && (
                  <div className="attr-item">
                    <span className="attr-label">Diamond CT</span>
                    <span className="attr-value">{product.diamondCt} ct</span>
                  </div>
                )}
                <div className="attr-item">
                  <span className="attr-label">Metal</span>
                  <span className="attr-value">18KT Yellow Gold</span>
                </div>
                <div className="attr-item">
                  <span className="attr-label">Delivery</span>
                  <span className="attr-value">{product.deliveryTime || 'Tomorrow'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="action-buttons">
                <AddToCartButton
                  id={product.id}
                  name={product.name}
                  code={product.code}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                  weight={product.weight}
                  diamondCt={product.diamondCt}
                />
                <Link href="/checkout" className="btn-buy-now" style={{ textDecoration: 'none', textAlign: 'center' }}>Buy Now</Link>
              </div>

              {/* Highlights */}
              <div className="product-highlights">
                <div className="highlight-item">
                  <ShieldCheck size={24} color="#C9A96E" />
                  <p>Purity Guaranteed</p>
                </div>
                <div className="highlight-item">
                  <RefreshCcw size={24} color="#C9A96E" />
                  <p>15-Day Returns</p>
                </div>
                <div className="highlight-item">
                  <Truck size={24} color="#C9A96E" />
                  <p>Free Insured Shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="container" style={{ marginTop: '60px', marginBottom: '60px' }}>
            <div className="section-title text-center">
              <h2>Products You May Like</h2>
              <p>Explore more stunning pieces from this collection.</p>
            </div>
            <div className="products-slider">
              {similarProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
