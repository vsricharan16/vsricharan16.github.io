import profile from '@/data/profile.json';

const CONTACT_ADDRESS = profile.email;

export default function EmailLink() {
  return (
    <div className="contact-email-container">
      <a href={`mailto:${CONTACT_ADDRESS}`} className="contact-email-link">
        {CONTACT_ADDRESS}
      </a>
    </div>
  );
}
