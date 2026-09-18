import { Link } from 'react-router';

import { AccountMenu } from './AccountMenu';

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Sing a Song home">
          <span className="brand-mark" aria-hidden="true">
            <i className="fa-solid fa-microphone-lines" />
          </span>
          <span className="brand-name">Sing a Song</span>
        </Link>

        <nav className="header-actions" aria-label="Account">
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
