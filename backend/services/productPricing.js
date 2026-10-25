function getProductPricing(product) {
  const originalPrice = Number(product.price);
  const offerPercentage = Number(product.offerPercentage || 0);
  const offerPrice = Math.round(originalPrice * (1 - offerPercentage / 100) * 100) / 100;
  return {
    originalPrice,
    offerPercentage,
    offerPrice,
    discountAmount: Math.round((originalPrice - offerPrice) * 100) / 100,
  };
}

function presentProduct(product) {
  const data = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
  let images;
  try {
    const storedImages = JSON.parse(data.image);
    images = Array.isArray(storedImages) ? storedImages : [data.image];
  } catch {
    images = data.image ? [data.image] : [];
  }
  return { ...data, image: images[0] || '', images, ...getProductPricing(data) };
}

module.exports = { getProductPricing, presentProduct };
