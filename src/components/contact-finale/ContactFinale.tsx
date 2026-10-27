import styles from './ContactFinale.module.css';

const email = 'antoniusjairusofficial@gmail.com';

export function ContactFinale() {
  return (
    <section id="contact" className={styles.chapter} aria-labelledby="contact-name">
      <noscript>
        <style>
          {'[role="progressbar"][aria-label="Site preloader"] { display: none !important; }'}
        </style>
      </noscript>
      <div className={styles.arrival} aria-hidden="true" />
      <p className={styles.kicker}>CONTACT</p>
      <h2 id="contact-name" className={styles.visuallyHidden}>
        Contact Antonius Jairus
      </h2>
      <div className={styles.composition}>
        <div className={styles.identity}>
          <p className={styles.lanyardHint}>Drag the badge · tap to flip · scan WhatsApp</p>
          <p className={styles.invitation}>Write to me.</p>
        </div>

        <div className={styles.actions}>
          <address className={styles.address}>
            <span className={styles.label}>EMAIL</span>
            <a href={`mailto:${email}`} className={styles.email}>
              {email}
            </a>
          </address>
          <p className={styles.whatsappNote}>
            Flip the identity badge to open the WhatsApp connection.
          </p>
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
