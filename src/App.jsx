import MockBanner from './components/MockBanner/MockBanner.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.layout}>
      <MockBanner />

      <header className={styles.header}>
        <span className={styles.logo}>Matcha</span>
      </header>

      <main className={styles.main}>
        <h1>Matcha</h1>
        <p>Phase 2 — couche API et mocks en place.</p>
      </main>

      <footer className={styles.footer}>
        <small>Projet 42 — {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}