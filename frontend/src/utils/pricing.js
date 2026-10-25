export function getProductPricing(product) {
  const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
  const offerPercentage = Number(product.offerPercentage || 0);
  const offerPrice = Number(
    product.offerPrice ?? Math.round(originalPrice * (1 - offerPercentage / 100) * 100) / 100
  );

  return {
    originalPrice,
    offerPercentage,
    offerPrice,
    discountAmount: Number(
      product.discountAmount ?? Math.round((originalPrice - offerPrice) * 100) / 100
    ),
  };
}
