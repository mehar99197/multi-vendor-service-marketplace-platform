import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Reveal, Stagger, StaggerItem } from '../components/common/Motion';

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Trusted Professionals',
    description: 'Every provider is verified and vetted to ensure top-quality service delivery for your business needs.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Guaranteed',
    description: "We stand behind every service. Get your money back if the work doesn't meet agreed standards.",
    color: 'from-fuchsia-500 to-purple-500',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    description: "Your payments are held in escrow and released only when you're satisfied with the delivered work.",
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock to help with any issues or questions.',
    color: 'from-cyan-500 to-sky-500',
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

const stats = [
  { value: '500+', label: 'Service Providers', color: 'text-indigo-400' },
  { value: '1000+', label: 'Projects Completed', color: 'text-fuchsia-400' },
  { value: '98%', label: 'Client Satisfaction', color: 'text-cyan-400' },
];

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/services?limit=6');
        setFeaturedServices(res.data.services || res.data.data || []);
      } catch {
        setFeaturedServices([]);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-28 lg:py-40">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 glass-soft px-4 py-1.5 text-sm text-gray-300"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            The marketplace for elite freelance talent
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Find Expert Services
            <span className="mt-2 block text-gradient">for Your Business</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-7 max-w-2xl text-lg text-gray-300 sm:text-xl"
          >
            Connect with top-rated professionals. Get your projects done on time, on budget, and with quality guaranteed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/services"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:from-indigo-500 hover:to-fuchsia-500 hover:scale-[1.03] glow-indigo"
            >
              Browse Services
            </Link>
            <Link
              to="/register?role=provider"
              className="rounded-xl border border-white/15 glass px-8 py-3.5 text-base font-semibold text-gray-100 transition-all hover:bg-white/5 hover:scale-[1.03]"
            >
              Become a Provider
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Why Choose Us</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">We make hiring skilled professionals simple and safe.</p>
          </Reveal>
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="h-full glass rounded-2xl p-6"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Browse by Category</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">Find the perfect expert for your project.</p>
          </Reveal>
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {categories.map((cat) => (
              <StaggerItem key={cat}>
                <Link
                  to={`/services?category=${encodeURIComponent(cat)}`}
                  className="group block h-full rounded-2xl glass p-6 transition-all hover:ring-glow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/30 text-xl font-bold text-indigo-300 transition-colors group-hover:from-indigo-600/50 group-hover:to-fuchsia-600/50">
                    {cat.charAt(0)}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-gradient">{cat}</h3>
                  <p className="mt-1 text-sm text-gray-500">Find top {cat.toLowerCase()} experts</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Featured services */}
      {featuredServices.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Featured Services</h2>
                <p className="mt-1 text-gray-400">Hand-picked services just for you.</p>
              </div>
              <Link to="/services" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                View All &rarr;
              </Link>
            </Reveal>
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {featuredServices.map((svc) => (
                <StaggerItem key={svc._id || svc.id}>
                  <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
                    <Link
                      to={`/services/${svc._id || svc.id}`}
                      className="group block h-full rounded-2xl glass p-6"
                    >
                      <h3 className="text-lg font-semibold transition-colors group-hover:text-gradient">{svc.title}</h3>
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{svc.description}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/20">
                          {svc.category}
                        </span>
                        <span className="text-lg font-bold text-white">${svc.price}</span>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="grid gap-6 rounded-3xl glass p-10 text-center sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className={`text-4xl font-extrabold sm:text-5xl ${s.color}`}>{s.value}</p>
                  <p className="mt-2 text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <Reveal className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to get started?</h2>
          <p className="mt-3 text-gray-400">Join thousands of businesses and freelancers already on our platform.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:from-indigo-500 hover:to-fuchsia-500 hover:scale-[1.03] glow-indigo"
            >
              Sign Up Free
            </Link>
            <Link
              to="/services"
              className="rounded-xl border border-white/15 glass px-8 py-3.5 text-base font-semibold text-gray-100 transition-all hover:bg-white/5 hover:scale-[1.03]"
            >
              Explore Services
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
