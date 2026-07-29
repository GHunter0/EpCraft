import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Check,
  Wrench,
  BadgeCheck,
  Truck,
  Box,
  ArrowRight
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <em>Artisan Wood</em>
        </div>
        <div className="user-profile">
          <div className="user-avatar"></div>
          <div className="user-info">
            <p>Welcome back</p>
            <p className="user-meta">Crafting since 2023</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item"><LayoutDashboard size={18} /> Overview</a>
          <a href="#" className="nav-item active"><Package size={18} /> Orders</a>
          <a href="#" className="nav-item"><Heart size={18} /> Wishlist</a>
          <a href="#" className="nav-item"><MapPin size={18} /> Addresses</a>
          <a href="#" className="nav-item"><CreditCard size={18} /> Payment Methods</a>
          <a href="#" className="nav-item"><Settings size={18} /> Settings</a>
        </nav>
        
        <div className="sidebar-footer">
          <a href="#" className="nav-item logout"><LogOut size={18} /> Logout</a>
        </div>
      </aside>
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Order History</h1>
          <p>Trace the journey of your handcrafted pieces from the forest to your home.</p>
        </header>
        
        <div className="active-order-card">
          <div className="active-order-header">
            <div>
              <h3>Order #EPC-82910</h3>
              <p>Placed Oct 12, 2024</p>
            </div>
            <span className="status-badge">In Production</span>
          </div>
          
          <div className="order-images">
            <img src="/table.png" alt="Dining Table" />
            <img src="/bowl.png" alt="Bowl" />
          </div>
          
          <div className="order-timeline">
            <div className="timeline-step completed">
              <div className="step-icon"><Check size={16} /></div>
              <p>Order Placed</p>
            </div>
            <div className="timeline-connector completed"></div>
            
            <div className="timeline-step current">
              <div className="step-icon"><Wrench size={16} /></div>
              <p>In Production</p>
            </div>
            <div className="timeline-connector pending"></div>
            
            <div className="timeline-step pending">
              <div className="step-icon"><BadgeCheck size={16} /></div>
              <p>Quality Check</p>
            </div>
            <div className="timeline-connector pending"></div>
            
            <div className="timeline-step pending">
              <div className="step-icon"><Truck size={16} /></div>
              <p>Shipped</p>
            </div>
            <div className="timeline-connector pending"></div>
            
            <div className="timeline-step pending">
              <div className="step-icon"><Box size={16} /></div>
              <p>Delivered</p>
            </div>
          </div>
          
          <div className="view-details">
            <a href="#">View Full Order Details <ArrowRight size={16} /></a>
          </div>
        </div>
        
        <div className="past-orders">
          <div className="past-order-item">
            <img src="/sculpture.png" alt="Sculpture" />
            <div className="past-order-info">
              <h4>Order #EPC-79224</h4>
              <p>Sept 18, 2024 &bull; Delivered</p>
            </div>
            <div className="past-order-meta">
              <span>3 Items</span>
              <a href="#" className="reorder-link">Reorder</a>
            </div>
          </div>
          
          <div className="past-order-item">
            <img src="/table.png" alt="Table" />
            <div className="past-order-info">
              <h4>Order #EPC-75011</h4>
              <p>Aug 05, 2024 &bull; Delivered</p>
            </div>
            <div className="past-order-meta">
              <span>1 Item</span>
              <a href="#" className="reorder-link">Reorder</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
