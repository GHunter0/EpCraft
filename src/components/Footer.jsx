import { Mail, Share2, Sparkles } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="footer-logo">EpCraft</h2>
            <p className="brand-desc">
              Crafting the future of wood with the precision of AI and the soul of the artisan.
            </p>
            <div className="social-links">
              <button className="icon-btn"><Mail size={18} strokeWidth={1.5} /></button>
              <button className="icon-btn"><Share2 size={18} strokeWidth={1.5} /></button>
            </div>
          </div>
          
          <div className="footer-nav">
            <h3 className="nav-title">Explore</h3>
            <ul>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
              <li><a href="#">The AI Design Lab</a></li>
              <li><a href="#">Wholesale</a></li>
            </ul>
          </div>
          
          <div className="footer-nav">
            <h3 className="nav-title">Concierge</h3>
            <ul>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Care Instructions</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-newsletter">
            <div className="sparkle-badge">
              <Sparkles size={24} color="#FFF" strokeWidth={1.5}/>
            </div>
            <h3 className="nav-title">Newsletter</h3>
            <p>Join our inner circle for early access and craftsmanship stories.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email Address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 EpCraft Handcrafted Wood. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
