import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authenticatedApi from "../../../api/Authenticated";
import { clearTokens, getAccessToken , logout} from "../../../api/auth";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!getAccessToken()) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await authenticatedApi.get("auth/profile/");
        setUser(response.data);
      } catch (requestError) {
        console.error("Profile request failed:", requestError);

        if (requestError.response?.status === 401) {
          clearTokens();
          window.location.replace("/login");
          return;
        }

        setError("We couldn't load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <main className="dashboard-page">Loading your account...</main>;
  }

  if (error) {
    return <main className="dashboard-page">{error}</main>;
  }

  return (
    <main className="dashboard-page">
      <p className="eyebrow">NORTHSTAR CUSTOMER SPACE</p>
      <h1>Welcome{user?.first_name ? `, ${user.first_name}` : ""}.</h1>
      <p>Your account is authenticated and ready.</p>
      <p>Email: {user?.email}</p>

      <Link to="/register">Registration page</Link>
      <button className="submit-button" type="button" onClick={logout}>
        Sign out
      </button>
    </main>
  );
}

export default Home;