const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
const cssCode = `
/* =========================================
   SINGLE PRODUCT PAGE STYLES
   ========================================= */
.product-details-page {
  padding: 40px 0 80px;
  background-color: #FAFAFA;
  min-height: calc(100vh - 200px);
}

.product-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 30px;
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #C9A96E;
}

.breadcrumb .current {
  color: #C9A96E;
  font-weight: 500;
}

.product-grid {
  display: flex;
  gap: 50px;
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.03);
}

.product-image-gallery {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.main-image img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  gap: 15px;
}

.thumbnail-list img {
  width: 80px;
  height: 80px;
  border: 1px solid #eee;
  border-radius: 6px;
  object-fit: contain;
  cursor: pointer;
  padding: 5px;
}

.thumbnail-list img.active-thumb, .thumbnail-list img:hover {
  border-color: #C9A96E;
}

.product-info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title-large {
  font-family: var(--font-playfair);
  font-size: 32px;
  color: #333;
  line-height: 1.2;
  margin-bottom: 8px;
}

.product-code {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
}

.price-section {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 5px;
}

.current-price-large {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.old-price-large {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 3px;
}

.discount-large {
  font-size: 16px;
  color: #d9534f;
  font-weight: 600;
  margin-bottom: 4px;
}

.tax-inclusive {
  font-size: 12px;
  color: #888;
  margin-bottom: 30px;
}

.attributes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
  background: #fdfbf7;
  padding: 20px;
  border: 1px solid #f0e6d2;
  border-radius: 8px;
}

.attr-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attr-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attr-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.btn-add-cart, .btn-buy-now {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-cart {
  background: transparent;
  border: 2px solid #C9A96E;
  color: #C9A96E;
}

.btn-add-cart:hover {
  background: #fdfbf7;
}

.btn-buy-now {
  background: #C9A96E;
  border: 2px solid #C9A96E;
  color: #fff;
}

.btn-buy-now:hover {
  background: #b5955a;
}

.product-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.highlight-item p {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

@media (max-width: 900px) {
  .product-grid {
    flex-direction: column;
    padding: 20px;
  }
}
`;

fs.appendFileSync(cssPath, cssCode);
console.log('Appended CSS to globals.css');
