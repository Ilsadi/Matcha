import { USE_MOCK } from '../../services/transport.js';
import styles from './MockBanner.module.css';

export default function MockBanner() {
  if (!USE_MOCK) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      Mode mock — aucune requête ne part vers le back
    </div>
  );
}