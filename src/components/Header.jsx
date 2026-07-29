import { Search, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">EpCraft</Link>
        <nav className="nav-links">
          <Link to="/cart">Shop</Link>
          <Link to="/cart">Custom Orders</Link>
          <Link to="/cart">Our Story</Link>
          <Link to="/cart">AI Stylist</Link>
        </nav>
        <div className="header-actions">
          <button aria-label="Search"><Search size={20} strokeWidth={1.5} /></button>
          <Link to="/cart" aria-label="Cart"><ShoppingCart size={20} strokeWidth={1.5} /></Link>
          <Link to="/account" aria-label="Account"><User size={20} strokeWidth={1.5} /></Link>
        </div>
      </div>
    </header>
  );
}
