'use client';

import Link from 'next/link';

type FooterLink = {
  label: string;
  href?: string;
  comingSoon?: boolean;
};

const productLinks: FooterLink[] = [
  { label: 'Manager', comingSoon: true },
  { label: 'Investor', comingSoon: true },
  { label: 'Developer', comingSoon: true },
  { label: 'Land', comingSoon: true },
  { label: 'Broker', comingSoon: true },
  { label: 'Lender', comingSoon: true },
];

const intelligenceLinks: FooterLink[] = [
  { label: 'Quantum Intelligence Score', comingSoon: true },
  { label: 'Buyer Demand Simulator', comingSoon: true },
  { label: 'Synthetic Buyer Pool', comingSoon: true },
  { label: 'Casa Bills', comingSoon: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About', comingSoon: true },
  { label: 'Why Casa', comingSoon: true },
  { label: 'Pricing', comingSoon: true },
  { label: 'Careers', comingSoon: true },
];

const resourceLinks: FooterLink[] = [
  { label: 'Industry Reports', comingSoon: true },
  { label: 'Blog', comingSoon: true },
  { label: 'Market Insights', comingSoon: true },
  { label: 'Glossary', comingSoon: true },
];

const connectLinks: FooterLink[] = [
  { label: 'Contact', comingSoon: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/usecasa' },
  { label: 'Twitter / X', href: 'https://twitter.com' },
  { label: 'Email', href: 'mailto:info@usecasa.io' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy', comingSoon: true },
  { label: 'Terms', comingSoon: true },
  { label: 'Security', comingSoon: true },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3
        className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.href ? (
              <Link
                href={link.href}
                className="text-sm text-neutral-800 transition-colors hover:text-[#F9D96A]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </Link>
            ) : (
              <span
                className="text-sm text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif' }}
                title="Coming soon"
              >
                {link.label}
                <span className="ml-1.5 text-[10px] uppercase tracking-wider text-neutral-300">
                  · soon
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="mb-16 flex flex-col gap-6 border-b border-neutral-100 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="inline-block">
              <span
                className="text-3xl tracking-tight text-neutral-900"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
              >
                CASA
              </span>
            </Link>
            <p
              className="mt-3 max-w-md text-base leading-relaxed text-neutral-600"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}
            >
              The Bloomberg Terminal for Real Estate.
            </p>
          </div>
          <div className="md:text-right">
            <p
              className="text-xs uppercase tracking-[0.18em] text-neutral-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              In private beta · 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-5">
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Intelligence" links={intelligenceLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Connect" links={connectLinks} />
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-neutral-100 pt-8 md:flex-row md:items-center md:justify-between">
          <p
            className="text-xs text-neutral-500"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            © {year} Casa Intelligence, Inc. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <Link
                    href={link.href}
                    className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    className="text-xs text-neutral-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    title="Coming soon"
                  >
                    {link.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mt-12 h-[2px] w-16"
          style={{ backgroundColor: '#F9D96A' }}
          aria-hidden
        />
      </div>
    </footer>
  );
}
