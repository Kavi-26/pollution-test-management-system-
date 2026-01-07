import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="public-layout">
            <nav className="navbar">
                <div className="container navbar-content">
                    <div className="brand">ANBU Emission Test</div>
                    <div className="nav-links">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                        <Link to="/verify" className="nav-link">Verify</Link>
                    </div>
                </div>
            </nav>
            <main className="page-content">
                <Outlet />
            </main>
        </div>
    );
}
