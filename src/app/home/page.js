'use client';

import Link from 'next/link';
import { useState } from 'react';

const features = [
  {
    icon: '📋',
    title: 'Customer & Measurement Database',
    desc: 'Save Male & Female measurements permanently. Full support for Shadda, Senator, Kaftan, Atamfa, Gown and more. Never ask a customer twice.',
  },
  {
    icon: '📦',
    title: 'Order Management',
    desc: 'Track every order from New → In Progress → Ready → Collected. Know exactly what is sitting in your shop at any time.',
  },
  {
    icon: '💰',
    title: 'Payment & Balance Tracker',
    desc: 'Record Full, Advance, or Balance payments. The app automatically calculates what each customer still owes you.',
  },
  {
    icon: '🔔',
    title: 'Collection Reminders',
    desc: 'Get alerts Today, Tomorrow, in 3 Days and 7 Days before collection dates. No more "I forgot".',
  },
  {
    icon: '🖨️',
    title: 'Professional Print & Share',
    desc: 'Generate a branded A4 receipt with your Logo, Measurements, and Payment details. Print or send on WhatsApp instantly.',
  },
  {
    icon: '📡',
    title: 'Works Offline',
    desc: 'No internet? No problem. KowaGuru TCMS works without internet and syncs your data when you are back online.',
  },
];

const pricing = [
  {
    name: 'FREE',
    price: '₦0',
    period: 'Forever',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Up to 50 Customers',
      'Order Management',
      'Payment Tracking',
      'Collection Reminders',
      'KowaGuru Branded Receipts',
    ],
    cta: 'Start for Free',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-700',
  },
  {
    name: 'PRO',
    price: '₦5,000',
    period: 'per month',
    color: 'border-red-600',
    badge: 'Most Popular',
    features: [
      'Unlimited Customers',
      'No Ads',
      'PDF Export',
      'Data Backup & Restore',
      'Custom Business Logo',
      'Priority Support',
    ],
    cta: 'Get Pro Access',
    ctaStyle: 'bg-red-700 text-white hover:bg-red-800',
  },
  {
    name: 'ENTERPRISE',
    price: '₦50,000',
    period: 'per year',
    color: 'border-green-600',
    badge: 'For Schools',
    features: [
      'Multi-User Access',
      'Cloud Sync',
      'Custom Logo & Branding',
      'Staff Training Session',
      'Full Reports & Analytics',
      'Dedicated Support Line',
    ],
    cta: 'Contact Us',
    ctaStyle: 'bg-green-700 text-white hover:bg-green-800',
  },
];

const faqs = [
  {
    q: 'Does it work without internet?',
    a: 'Yes! KowaGuru TCMS is designed to work fully offline. Your data is saved on your device and syncs to the cloud whenever you have an internet connection.',
  },
  {
    q: 'Can I print receipts for my customers?',
    a: 'Absolutely. You can generate a professional A4 receipt showing your business logo, customer measurements, order details, and payment summary. Print it or send it directly on WhatsApp.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Your data is securely stored and encrypted. Only you can access your account. We do not share your customer data with anyone.',
  },
  {
    q: 'Can I use it for both male and female customers?',
    a: 'Yes! We have full measurement forms for both. The male form includes all measurements for Shadda, Senator, Kaftan and more (FL, SW, SL, N, S, C, W, H, TH, K, A).',
  },
  {
    q: 'How do I get started?',
    a: 'Simply click "Start for Free", request access, and we will set up your account. No credit card required for the free plan.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-red-700 rounded-xl flex items-center justify-center shadow">
            <span className="text-white text-lg font-bold font-serif">K</span>
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">KowaGuru TCMS</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/2348023603283"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.989.574 3.842 1.563 5.408L2 22l4.763-1.528A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18a7.96 7.96 0 0 1-4.062-1.11l-.292-.173-3.006.964.981-2.924-.19-.3A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
            Book a Demo
          </a>
          <Link
            href="/auth/login"
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white transition-all"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #b91c1c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #15803d 0%, transparent 50%)'}} />
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 text-center">
          <span className="inline-block bg-red-700/30 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            🇳🇬 Built for Nigerian Tailors
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            The <span className="text-red-400">#1 App</span> for Tailors<br />and Fashion Designers
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop losing customer measurements. Stop missing collection dates. Stop manual books.<br />
            <strong className="text-white">KowaGuru TCMS</strong> manages your customers, measurements, orders, and payments — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/request-access"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl shadow-red-900/50 transition-all hover:-translate-y-0.5"
            >
              ✂️ Start Using for Free
            </Link>
            <a
              href="https://wa.me/2348023603283?text=Hello, I want to book a free demo of KowaGuru TCMS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg border border-white/20 transition-all"
            >
              📞 Book a Free Demo
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">No credit card required · Free plan available · Works on any phone</p>
        </div>
      </section>

      {/* ========== PROBLEM SECTION ========== */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Still Using a Paper Book?</h2>
          <p className="text-gray-500 text-lg mb-10">Every tailor using a paper book is losing money every single day.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              '❌ Lost measurements → Angry customers',
              '❌ Forgotten orders → Lost money',
              '❌ No payment tracking → Bad debts',
              '❌ No reminders → Late deliveries',
            ].map((item) => (
              <div key={item} className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm font-semibold text-red-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Everything Your Shop Needs</h2>
            <p className="text-gray-500 mt-3 text-lg">10 powerful features, all in one simple app.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-extrabold text-gray-900 mb-2 text-base">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register Your Customer', desc: 'Enter the customer\'s name, phone, and take their full measurements once. It is saved forever.' },
              { step: '02', title: 'Create & Track the Order', desc: 'Add the order details, fabric, price, and collection date. Watch it move from New to Ready.' },
              { step: '03', title: 'Print, Share & Deliver', desc: 'Generate a professional receipt and deliver on time. Your customer will be impressed.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-red-700 flex items-center justify-center text-2xl font-black mb-4">{item.step}</div>
                <h3 className="font-extrabold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-3 text-lg">Start free. Upgrade when your business grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white border-2 ${plan.color} rounded-2xl p-8 shadow-sm flex flex-col ${plan.badge === 'Most Popular' ? 'shadow-xl scale-105' : ''}`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white ${plan.badge === 'Most Popular' ? 'bg-red-600' : 'bg-green-600'}`}>
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{plan.name}</p>
                  <p className="text-4xl font-extrabold text-gray-900">{plan.price}</p>
                  <p className="text-sm text-gray-400 mt-1">{plan.period}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                {plan.name === 'ENTERPRISE' ? (
                  <a
                    href="https://wa.me/2348023603283?text=I am interested in the Enterprise plan for KowaGuru TCMS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center font-bold py-3 rounded-xl transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link href="/auth/request-access" className={`w-full block text-center font-bold py-3 rounded-xl transition-all ${plan.ctaStyle}`}>
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIAL ========== */}
      <section className="bg-red-700 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-3xl font-bold italic leading-snug mb-6">
            "Since I started using TCMS, I no longer misplace books. My customers trust me more."
          </p>
          <p className="text-red-200 font-semibold">— Professional Tailor, Onitsha</p>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <span className={`text-red-600 text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="bg-gray-950 text-white py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to Digitize Your Shop?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Join tailors across Nigeria who are using KowaGuru TCMS to grow their business and impress their customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/request-access"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-red-900/50 transition-all hover:-translate-y-0.5"
          >
            ✂️ Start Using for Free Today
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-4 rounded-2xl text-lg border border-white/20 transition-all"
          >
            Already have an account? Login
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-950 border-t border-white/5 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-8 w-8 bg-red-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-base font-bold font-serif">K</span>
          </div>
          <span className="text-white font-extrabold">KowaGuru TCMS</span>
        </div>
        <p className="text-gray-500 text-sm mb-2">The Digital Tailor Management System</p>
        <p className="text-gray-600 text-xs">
          © 2026 KowaGuru Technology Limited · <a href="https://wa.me/2348023603283" className="hover:text-gray-400 transition-colors">WhatsApp Support</a> · tcms.kowagurutech.ng
        </p>
      </footer>

      {/* ========== FLOATING WHATSAPP ========== */}
      <a
        href="https://wa.me/2348023603283"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl z-50 flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Contact Support on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.989.574 3.842 1.563 5.408L2 22l4.763-1.528A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18a7.96 7.96 0 0 1-4.062-1.11l-.292-.173-3.006.964.981-2.924-.19-.3A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
      </a>
    </div>
  );
}
