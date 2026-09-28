import Link from 'next/link';

import profile from '@/data/profile.json';
import { newTabProps } from '@/lib/links';

import ThemePortrait from './ThemePortrait';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-primary">
          <h1 className="hero-title">
            <span className="hero-name">{profile.givenName}</span>
          </h1>

          <p className="hero-tagline">
            I&apos;m a {profile.role} at{' '}
            <a
              href="https://www.nutanix.com"
              className="hero-highlight"
              {...newTabProps('https://www.nutanix.com')}
            >
              {profile.employer}
            </a>
            , working at the intersection of distributed systems and storage. I
            tackle hard engineering problems to build petabyte-scale storage
            control planes and highly concurrent architectures where high
            throughput and ultra-low latency are critical. Whether I&apos;m
            designing massive systems or just tinkering on my own time, I&apos;m
            a C++ enthusiast at heart.
          </p>

          <div className="hero-cta">
            <Link href="/about" className="button">
              About Me
            </Link>
            <Link href="/resume" className="hero-resume-link">
              View Resume
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="hero-portrait">
          <ThemePortrait width={320} height={320} priority />
        </div>
      </div>

      <div className="hero-bg" aria-hidden="true" />
    </section>
  );
}
