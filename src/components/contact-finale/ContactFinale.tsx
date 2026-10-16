import Image from 'next/image';
import styles from './ContactFinale.module.css';

const email = 'antoniusjairusofficial@gmail.com';

export function ContactFinale() {
  return (
    <section id="contact" className={styles.chapter} aria-labelledby="contact-name">
      <div className={styles.arrival} aria-hidden="true" />
      <div className={styles.composition}>
        <div className={styles.identity}>
          <p className={styles.kicker}>CONTACT</p>
          <h2 id="contact-name">Antonius Jairus.</h2>
          <p className={styles.invitation}>Write to me.</p>
        </div>

        <div className={styles.actions}>
          <address className={styles.address}>
            <span className={styles.label}>EMAIL</span>
            <a href={`mailto:${email}`} className={styles.email}>
              {email}
            </a>
          </address>
          <figure className={styles.qr}>
            <Image
              src="/contact-email-qr.svg"
              width={172}
              height={172}
              unoptimized
              alt=""
              aria-hidden="true"
            />
            <figcaption>Scan to email</figcaption>
          </figure>
        </div>
      </div>

      <nav className={styles.socials} aria-label="Social profiles">
        <a href="https://github.com/antoniusjairus4" target="_blank" rel="noopener noreferrer">
          GITHUB
        </a>
        <a
          href="https://www.linkedin.com/in/antoniusjairus4/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LINKEDIN
        </a>
        <a
          href="https://www.instagram.com/antoniusjairus4/"
          target="_blank"
          rel="noopener noreferrer"
        >
          INSTAGRAM
        </a>
      </nav>

      <footer className={styles.end}>
        <span>ANTONIUS JAIRUS</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </section>
  );
}
