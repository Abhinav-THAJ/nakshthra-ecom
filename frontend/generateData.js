const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'FINAL OUT PRODUCT RETOUCHING');
const DEST_IMG_DIR = path.join(__dirname, 'public', 'images', 'products');
const DEST_MOCK_FILE = path.join(__dirname, 'src', 'data', 'mockProducts.ts');

if (!fs.existsSync(DEST_IMG_DIR)) {
  fs.mkdirSync(DEST_IMG_DIR, { recursive: true });
}

const CATEGORY_MAP = {
  'DAIMOND BANGLE': { slug: 'bracelets', name: 'Bangle' },
  'DAIMOND BRACELET': { slug: 'bracelets', name: 'Bracelet' },
  'DAIMOND NECKLACE': { slug: 'necklaces', name: 'Necklace' },
  'DAIMOND PENDANT': { slug: 'necklaces', name: 'Pendant' },
  'DIAMOND FINGER RING': { slug: 'rings', name: 'Ring' },
  'DIAMOND NOSE PIN': { slug: 'earrings', name: 'Nose Pin' },
  'DIAMOND STUD': { slug: 'earrings', name: 'Stud' }
};

let products = [];
let usedIds = new Set();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function processDirectory(dirPath) {
  const categories = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());

  for (const cat of categories) {
    const catMap = CATEGORY_MAP[cat] || { slug: 'jewellery', name: 'Jewellery' };
    const catPath = path.join(dirPath, cat);
    const itemFolders = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());

    for (const folder of itemFolders) {
      const itemPath = path.join(catPath, folder);
      let files = fs.readdirSync(itemPath)
        .filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort(); // sort so (1) < (2) < (3) < (4)

      if (files.length === 0) continue;

      // Move the last file to the front (clean product shot without text)
      // The spec-sheet image with writing goes last
      if (files.length > 1) {
        const last = files.pop(); // remove last item
        files = [last, ...files]; // put it first
      }

      let mainImageFile = files[0];

      // Extract DMD code from filename
      const match = mainImageFile.match(/(DMD\s*\d+)/i);
      let code = match ? match[1].toUpperCase().replace(/\s+/, ' ') : 'UNKNOWN';
      let id = slugify(code);

      if (id === 'unknown') {
        id = `item-${Math.floor(Math.random() * 10000)}`;
      }

      if (usedIds.has(id)) {
        id = `${id}-${Math.floor(Math.random() * 1000)}`;
      }
      usedIds.add(id);

      // Copy ALL images for this product
      const images = [];
      for (const file of files) {
        const ext = path.extname(file);
        // Name them: dmd0138-1.jpg, dmd0138-2.jpg etc.
        const fileIndex = files.indexOf(file) + 1;
        const newImgName = `${id}-${fileIndex}${ext}`;
        const destImgPath = path.join(DEST_IMG_DIR, newImgName);
        fs.copyFileSync(path.join(itemPath, file), destImgPath);
        images.push(`/images/products/${newImgName}`);
      }

      // Try to extract diamond CT from folder name
      let diamondCt = '0.10';
      const ctMatch = folder.match(/([\d\.]+)\s*CT/i) || folder.match(/\(([\d\.]+)\)/);
      if (ctMatch) diamondCt = ctMatch[1];

      // Sanitize product name from folder (remove CT info)
      const cleanFolderName = folder.replace(/[\(\)]/g, '').replace(/\s+/g, ' ').trim();

      // Build product object
      products.push({
        id,
        name: `${catMap.name} - ${cleanFolderName}`,
        code: code,
        price: Math.floor(Math.random() * 30000) + 20000,
        oldPrice: 0,
        image: images[0],        // main image = first
        images: images,          // ALL images for gallery
        rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)),
        reviews: Math.floor(Math.random() * 50) + 5,
        deliveryTime: 'Tomorrow',
        isNew: true,
        categoryId: catMap.slug,
        weight: '3.00g',
        diamondCt: diamondCt,
        description: `A stunning ${cleanFolderName} ${catMap.name.toLowerCase()} featuring brilliant diamonds.`
      });
    }
  }
}

processDirectory(SOURCE_DIR);

// Generate oldPrice
products = products.map(p => ({
  ...p,
  oldPrice: Math.floor(p.price * 1.15)
}));

// Create mockProducts.ts content
const tsContent = `export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  deliveryTime?: string;
  isNew?: boolean;
  categoryId: string;
  weight?: string;
  diamondCt?: string;
  description?: string;
}

export const mockProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(DEST_MOCK_FILE, tsContent);
console.log(`Generated ${products.length} products successfully with all images!`);
