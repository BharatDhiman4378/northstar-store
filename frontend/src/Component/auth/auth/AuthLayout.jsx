import { Link } from "react-router-dom";
import * as Constants from '../../../Constants/allConstants';

function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <main className="register-page">
      <section className="register-card">
        <Link className="brand" to="/" aria-label="Northstar Store home">
          NORTHSTAR<span>.</span>
        </Link>

        <p className="eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="subtitle">{description}</p>

        {children}
      </section>

      <aside className="visual-panel">
        <div className="visual-content">
          <p className="eyebrow">{Constants.EYEBROW}</p>

          <h2>{Constants.EYEBROW_TAG_LINE}</h2>

          <p>
            {Constants.EYEBROW_CONTENT}
          </p>
        </div>

        <div className="visual-caption">
          <span>{Constants.VISUAL_CAPTION}</span>
          <span>{Constants.ESTABLISH}</span>
        </div>
      </aside>
    </main>
  );
}

export default AuthLayout;