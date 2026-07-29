import { Minus, Plus, Trash2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  return (
    <div className="container cart-page">
      <div className="cart-main">
        <h1 className="page-title">Your Selection</h1>
        
        <div className="cart-items">
          <div className="cart-item">
            <img src="/table.png" alt="Modern Heirloom Dining Table" className="item-image" />
            <div className="item-details">
              <h3 className="item-title">Modern Heirloom Dining Table</h3>
              <p className="item-meta">Material: Solid Walnut &bull; Size: 8-Person</p>
              
              <div className="item-actions">
                <div className="quantity-selector">
                  <button><Minus size={14} /></button>
                  <span>1</span>
                  <button><Plus size={14} /></button>
                </div>
                <span className="item-price">Rs. 3,250.00</span>
              </div>
            </div>
            <button className="remove-btn"><Trash2 size={18} strokeWidth={1.5} /></button>
          </div>
          
          <div className="cart-item">
            <img src="/sculpture.png" alt="Organic Form Sculpture" className="item-image" />
            <div className="item-details">
              <h3 className="item-title">Organic Form Sculpture</h3>
              <p className="item-meta">Material: White Oak &bull; Edition: Artisan</p>
              
              <div className="item-actions">
                <div className="quantity-selector">
                  <button><Minus size={14} /></button>
                  <span>1</span>
                  <button><Plus size={14} /></button>
                </div>
                <span className="item-price">Rs. 420.00</span>
              </div>
            </div>
            <button className="remove-btn"><Trash2 size={18} strokeWidth={1.5} /></button>
          </div>
        </div>

        <div className="complete-the-look">
          <div className="ctl-header">
            <h2><SparkleIcon /> Complete the Look</h2>
            <div className="ctl-nav">
              <button><ChevronLeft size={20} /></button>
              <button><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="ctl-grid">
            <div className="ctl-card">
              <div className="ctl-image-wrapper">
                <img src="/table.png" alt="Curated Dining Chairs" />
                <button className="quick-add"><Plus size={16} /></button>
              </div>
              <h4>CURATED DINING CHAIRS</h4>
              <p>$1,850.00</p>
            </div>
            <div className="ctl-card">
              <div className="ctl-image-wrapper">
                <img src="/bowl.png" alt="Organic Form Bowl" />
                <button className="quick-add"><Plus size={16} /></button>
              </div>
              <h4>ORGANIC FORM BOWL</h4>
              <p>$125.00</p>
            </div>
            <div className="ctl-card">
              <div className="ctl-image-wrapper">
                <img src="/table.png" alt="Minimalist Brass" />
                <button className="quick-add"><Plus size={16} /></button>
              </div>
              <h4>MINIMALIST BRASS</h4>
              <p>$340.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cart-sidebar">
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>Rs. 3,670.00</span>
            </div>
            <div className="summary-line">
              <span>Estimated Shipping</span>
              <span>Rs. 120.00</span>
            </div>
            <div className="summary-line">
              <span>Estimated Tax</span>
              <span>Rs. 293.60</span>
            </div>
          </div>
          
          <div className="discount-section">
            <label>DISCOUNT CODE</label>
            <div className="discount-input-group">
              <input type="text" placeholder="Enter code" />
              <button>Apply</button>
            </div>
          </div>
          
          <div className="summary-total">
            <div className="total-label">Total</div>
            <div className="total-value">
              <div className="amount">Rs. 4,083.60</div>
              <div className="financing">Available for 12 mo. financing</div>
            </div>
          </div>
          
          <Link to="/success" className="checkout-btn">
            Proceed to Checkout <Lock size={16} />
          </Link>
          
          <div className="secure-payments">
            <p>SECURE PAYMENTS ACCEPTED</p>
            <div className="payment-icons">
              <span className="pay-badge">VISA</span>
              <span className="pay-badge">MC</span>
              <span className="pay-badge">AMEX</span>
              <span className="pay-badge">PAY</span>
            </div>
          </div>
          
          <div className="guarantee-box">
            <div className="shield-icon">✓</div>
            <p>Every EpCraft purchase is protected by our Lifetime Craftsmanship Guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" fill="var(--accent-color)" />
    </svg>
  );
}
