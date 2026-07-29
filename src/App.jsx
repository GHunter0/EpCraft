import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Cart />} />
        <Route path="cart" element={<Cart />} />
        <Route path="success" element={<OrderConfirmation />} />
        <Route path="account" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
