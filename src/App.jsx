import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';
import HomePromos from './pages/Home';
import CategoryPage from './pages/Category';
import PlaceOrder from './pages/PlaceOrder';
import ViewCart from './pages/View-cart';
import { Toaster } from 'react-hot-toast'; // ✅ Import Toaster
import Art from './pages/Art';
import Sports from './pages/Sports';
import Baby from './pages/Baby';
import Clothing from './pages/Clothing';
import Kitchen from './pages/Kitchen';
import Signin from './pages/Signin';

function App() {
  return (
    <Router>
      {/* ✅ Toast Container */}
      <Toaster/>

      <Navbar />
      <Routes>
        <Route path="/" element={<HomePromos />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/view-cart" element={<ViewCart />} />
        <Route path="/art" element={<Art />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/baby" element={<Baby />} />
        <Route path="/clothing" element={<Clothing />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/signin" element={<Signin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
