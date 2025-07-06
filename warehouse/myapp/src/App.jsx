// App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import BoxDisplay from "./components/BoxDisplay";

function App() {
  return (
    <Router>
      <div className="bg-zinc-800 min-h-screen w-full">
        {/* You can uncomment the Navbar if needed */}
        {/* <Navbar /> */}

        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />

          {/* Box Display Route */}
          <Route path="/box-preview" element={<BoxDisplay />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

