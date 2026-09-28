import Link from 'next/link';

import ContactIcons from '@/components/Contact/ContactIcons';
import profile from '@/data/profile.json';
import routes, { isListedRoute } from '@/data/routes';
import { AUTHOR_NAME } from '@/lib/utils';

import ThemePortrait from './ThemePortrait';

export default function Footer() {
  const currentRole = `${profile.role}, ${profile.employer}`;

  return (
    <footer className="site-footer-new">
      <div className="footer-content">
        <div className="footer-identity">
          <Link href="/" className="footer-avatar">
            <ThemePortrait width={80} height={80} />
          </Link>
          <div className="footer-info">
            <span className="footer-name">{AUTHOR_NAME}</span>
            <p className="footer-role">{currentRole}</p>
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <nav className="footer-links" aria-labelledby="footer-links-heading">
          <span id="footer-links-heading" className="footer-links-label">
            Explore
          </span>
          <div className="footer-links-grid">
            {routes
              .filter((route) => !route.index && isListedRoute(route))
              .map((route) => (
                <Link key={route.path} href={route.path}>
                  {route.label}
                </Link>
              ))}
          </div>
        </nav>

        <div className="footer-social" aria-labelledby="footer-social-heading">
          <span id="footer-social-heading" className="footer-social-label">
            Connect
          </span>
          <ContactIcons />
        </div>
      </div>
    </footer>
  );
}
