import { useMemo, useState } from 'react';
import ProductCard from '../../components/ProductCard';

export default function ProductCatalogPage({ products, onAddToCart }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  const categories = ['All', ...new Set(products.map((item) => item.category))];

  const filteredProducts = useMemo(() => {
    let items = [...products];

    if (category !== 'All') {
      items = items.filter((product) => product.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (product) => product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
      );
    }

    if (sort === 'low-high') items.sort((a, b) => a.price - b.price);
    if (sort === 'high-low') items.sort((a, b) => b.price - a.price);
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [products, category, search, sort]);

  return (
    <div className="catalog-shell">
      <div className="catalog-header">
        <div>
          <p className="eyebrow">Browse</p>
          <h1>All Products</h1>
        </div>
      </div>

      <div className="catalog-controls">
        <input
          type="text"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}
