import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const categories = [
  'All',
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Logo Design',
  'Social Media Management',
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'delivery', label: 'Delivery Time' },
];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Map the UI sort options to the query values the API understands.
        const sortMap = {
          newest: '-createdAt',
          price_low: 'price',
          price_high: '-price',
          delivery: 'deliveryTime',
        };
        const params = {};
        if (sortMap[sort]) params.sort = sortMap[sort];
        if (search) params.search = search;
        if (category && category !== 'All') params.category = category;

        const res = await api.get('/services', { params });
        setServices(res.data.services || res.data.data || []);
      } catch {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [search, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params);
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    const params = {};
    if (search) params.search = search;
    if (cat && cat !== 'All') params.category = cat;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params);
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-4 w-4 ${i < full ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="mt-1 text-gray-400">Find the perfect professional for your project.</p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-500"
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : services.length === 0 ? (
          <div className="mt-16 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-300">No services found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <Link
                key={svc._id || svc.id}
                to={`/services/${svc._id || svc.id}`}
                className="group rounded-xl border border-gray-800 bg-gray-800 p-6 transition hover:border-gray-700 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-block rounded bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-400">
                    {svc.category}
                  </span>
                  <span className="text-xl font-bold text-white">${svc.price}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold group-hover:text-blue-400">{svc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-2">{svc.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-0.5">{renderStars(svc.averageRating || svc.rating)}</div>
                  <span>({svc.reviewCount || 0})</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">by {svc.provider?.name || 'Provider'}</span>
                  <span className="text-gray-500">{svc.deliveryTime} days</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
