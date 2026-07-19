// utils/productImages.js

const images = {
  curd: require('../screens/assets/products/curd.jpeg'),
  milk: require('../screens/assets/products/milk.jpeg'),
  ghee: require('../screens/assets/products/ghee.jpeg'),
  paneer: require('../screens/assets/products/paneer.jpeg'),
  butter: require('../screens/assets/products/butter.jpeg'),
  carrot: require('../screens/assets/products/carrot.jpeg'),
  'tender coconut': require('../screens/assets/products/tendercoconut.jpeg'),
  tomato: require('../screens/assets/products/tomato.jpeg'),
};

const fallback = require('../screens/assets/products/milk.jpeg');

export function getProductImage(productName = '') {
  const key = productName.toLowerCase().trim();

  if (images[key]) return images[key];

  const match = Object.keys(images).find(name => key.includes(name));
  if (match) return images[match];

  return fallback;
}