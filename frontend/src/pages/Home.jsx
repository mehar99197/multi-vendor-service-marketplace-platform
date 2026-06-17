import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Trusted Professionals',
    description: 'Every provider is verified and vetted to ensure top-quality service delivery for your business needs.',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Guaranteed',
    description: 'We stand behind every service. Get your money back if the work doesn\'t meet agreed standards.',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: 'Your payments are held in escrow and released only when you\'re satisfied with the delivered work.',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock to help with any issues or questions.',
  },
];

const categories = [
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Logo Design',
  'Social Media Management',
];

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/services?limit=6');
        setFeaturedServices(res.data.services || res.data.data || []);
      } catch {
        setFeaturedServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find Expert Services
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">for Your Business</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
            Connect with top-rated professionals. Get your projects done on time, on budget, and with quality guaranteed.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/services"
              className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Browse Services
            </Link>
            <Link
              to="/register?role=provider"
              className="rounded-lg border border-gray-600 bg-gray-800 px-8 py-3.5 text-base font-semibold text-gray-200 transition hover:bg-gray-700"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold">Why Choose Us</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">We make hiring skilled professionals simple and safe.</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-800/50 p-6 transition hover:border-gray-700 hover:bg-gray-800">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-800/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold">Browse by Category</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">Find the perfect expert for your project.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/services?category=${encodeURIComponent(cat)}`}
                className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10 text-xl font-bold text-blue-400 group-hover:bg-blue-600/20">
                  {cat.charAt(0)}
                </div>
                <h3 className="mt-4 text-lg font-semibold group-hover:text-blue-400">{cat}</h3>
                <p className="mt-1 text-sm text-gray-500">Find top {cat.toLowerCase()} experts</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredServices.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Featured Services</h2>
                <p className="mt-1 text-gray-400">Hand-picked services just for you.</p>
              </div>
              <Link to="/services" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                View All &rarr;
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((svc) => (
                <Link
                  key={svc._id || svc.id}
                  to={`/services/${svc._id || svc.id}`}
                  className="group rounded-xl border border-gray-800 bg-gray-800 p-5 transition hover:border-gray-700 hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold group-hover:text-blue-400">{svc.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">{svc.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-block rounded bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-400">
                      {svc.category}
                    </span>
                    <span className="text-lg font-bold text-white">${svc.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-gray-800 bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-blue-400">500+</p>
              <p className="mt-1 text-gray-400">Service Providers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-400">1000+</p>
              <p className="mt-1 text-gray-400">Projects Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400">98%</p>
              <p className="mt-1 text-gray-400">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-gray-400">Join thousands of businesses and freelancers already on our platform.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Sign Up Free
            </Link>
            <Link
              to="/services"
              className="rounded-lg border border-gray-600 bg-gray-800 px-8 py-3.5 text-base font-semibold text-gray-200 transition hover:bg-gray-700"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
