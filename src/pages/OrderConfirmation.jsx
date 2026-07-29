import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  return (
    <div className="container confirmation-page">
      <div className="success-header">
        <div className="success-icon-wrapper">
          <Check size={40} strokeWidth={3} color="#fff" />
        </div>
        
        <h1 className="success-title">
          Thank you, Julian!<br/>
          Your order is being<br/>
          handcrafted.
        </h1>
        
        <div className="order-meta">
          <p className="order-number">ORDER #EPC-82910</p>
          <p className="estimated-delivery">Estimated delivery: October 12 - 18</p>
        </div>
      </div>
      
      <div className="order-summary-card">
        <h4 className="card-title">ORDER SUMMARY</h4>
        
        <div className="order-items">
          <div className="order-item">
            <img src="/table.png" alt="Dining Table" />
            <div className="item-info">
              <h5>Modern Heirloom Dining Table</h5>
              <p>Solid Walnut / 8-Seater</p>
            </div>
            <div className="item-price">Rs. 3,450.00</div>
          </div>
          
          <div className="order-item">
            <img src="/bowl.png" alt="Bowl" />
            <div className="item-info">
              <h5>Organic Form Bowl</h5>
              <p>Oak / Small</p>
            </div>
            <div className="item-price">Rs. 492.00</div>
          </div>
        </div>
        
        <div className="order-total-row">
          <span className="total-label">Total Amount Paid</span>
          <span className="total-amount">Rs. 3,942.00</span>
        </div>
      </div>
      
      <div className="success-actions">
        <Link to="/account" className="btn-primary">Track Your Order</Link>
        <Link to="/" className="btn-secondary">Continue Shopping</Link>
      </div>
      
      <p className="craftsman-note">"Your craftsman will begin work within 24 hours"</p>
    </div>
  );
}
