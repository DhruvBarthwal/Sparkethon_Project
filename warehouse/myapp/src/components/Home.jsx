import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";
import Dashboard from "./Dashboard";
import BoxDisplay from "./BoxDisplay";
import ThreeDBox from "./ThreeDBox";
import {
  Home as HomeIcon,
  ClipboardList,
  Bell,
  HelpCircle,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [orders, setOrders] = useState([]);
  const [selectOrders, setSelectOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mlResponse, setMlResponse] = useState(null);

  
  const navigate = useNavigate();

  const [importedStats, setImportedStats] = useState(() => ({
    total: Number(localStorage.getItem("importedTotalOrders")) || 0,
    revenue: Number(localStorage.getItem("importedTotalRevenue")) || 0,
    paid: Number(localStorage.getItem("importedPaidOrders")) || 0,
    cancelled: Number(localStorage.getItem("importedCancelledOrders")) || 0,
    pending: Number(localStorage.getItem("importedPendingOrders")) || 0,
  }));

  const handleGoToBoxDisplay = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const items = viewOrder?.items || [];
      const totalVolume = items.reduce(
        (sum, item) =>
          sum + (item.width || 10) * (item.height || 10) * (item.depth || 10),
        0
      );
      const boxSize = Math.ceil(Math.pow(totalVolume, 1 / 3)) * 1.2;

      navigate("/box-preview", {
        state: {
          order: viewOrder,
          boxSize: boxSize,
        },
      });
      setIsGenerating(false);
    }, 8000);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const firestoreOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const localOrders = JSON.parse(localStorage.getItem("localOrders")) || [];
      const combinedOrders = [
        ...firestoreOrders,
        ...localOrders.filter(
          (local) => !firestoreOrders.some((f) => f.id === local.id)
        ),
      ];

      setOrders(combinedOrders);
    });

    return () => unsub();
  }, []);

  const toggleOrder = (id) => {
    setSelectOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    const imported = orders.filter((o) => selectOrders.includes(o.id));
    const total = imported.length;
    const paid = imported.filter(
      (o) => o.status?.toLowerCase() === "paid"
    ).length;
    const cancelled = imported.filter(
      (o) => o.status?.toLowerCase() === "cancelled"
    ).length;
    const pending = imported.filter(
      (o) => o.status?.toLowerCase() === "pending"
    ).length;
    const revenue = imported.reduce(
      (acc, curr) => acc + Number(curr.total || 0),
      0
    );

    const newStats = {
      total: importedStats.total + total,
      revenue: importedStats.revenue + revenue,
      paid: importedStats.paid + paid,
      cancelled: importedStats.cancelled + cancelled,
      pending: importedStats.pending + pending,
    };

    Object.entries(newStats).forEach(([key, value]) =>
      localStorage.setItem(
        `imported${key.charAt(0).toUpperCase() + key.slice(1)}`,
        value
      )
    );
    setImportedStats(newStats);

    for (const id of selectOrders) {
      await deleteDoc(doc(db, "orders", id));
    }

    const localOrders = JSON.parse(localStorage.getItem("localOrders")) || [];
    const updatedLocalOrders = localOrders.filter(
      (order) => !selectOrders.includes(order.id)
    );
    localStorage.setItem("localOrders", JSON.stringify(updatedLocalOrders));

    if (viewOrder && selectOrders.includes(viewOrder.id)) {
      setViewOrder(null);
    }

    setSelectOrders([]);
  };

  const handleDelete = async () => {
    for (const id of selectOrders) {
      await deleteDoc(doc(db, "orders", id));
    }

    const localOrders = JSON.parse(localStorage.getItem("localOrders")) || [];
    const updatedLocalOrders = localOrders.filter(
      (order) => !selectOrders.includes(order.id)
    );
    localStorage.setItem("localOrders", JSON.stringify(updatedLocalOrders));

    if (viewOrder && selectOrders.includes(viewOrder.id)) {
      setViewOrder(null);
    }

    setSelectOrders([]);
  };
  const handlePreviewPackaging = async () => {
    setLoadingPreview(true);
    setMlResponse(null); // Reset previous response

    try {
      const items = viewOrder?.items || [];

      const formattedItems = items.map((item) => ({
        width: item.width || 10,
        height: item.height || 10,
        depth: item.depth || 10,
        weight: item.weight || 1,
      }));

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: formattedItems }),
      });

      const data = await response.json();
      console.log("ML Model Response:", data);
      setMlResponse(data);
    } catch (error) {
      console.error("Error calling ML model:", error);
      setMlResponse({ error: "Unable to fetch recommendation." });
    }

    setTimeout(() => {
      setLoadingPreview(false);
      setPreviewMode(true);
    }, 3000); // You can reduce delay here
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] h-full bg-[#1E1E2D] text-white flex flex-col justify-between py-6 px-4 z-50">
        <div>
          <h2 className="text-2xl font-bold mb-8">WalMart</h2>
          <nav className="space-y-3">
            {[
              { label: "Dashboard", icon: <HomeIcon /> },
              { label: "Orders", icon: <ClipboardList /> },
              { label: "Notifications", icon: <Bell /> },
              { label: "Help", icon: <HelpCircle /> },
              { label: "About", icon: <Info /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  item.label === "Orders"
                    ? "bg-white text-black font-semibold"
                    : "hover:bg-[#2A2A3B] text-white"
                }`}
              >
                <div className="text-xl">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex h-full">
        {/* Orders Table */}
        <div
          className={`${
            viewOrder ? "w-2/3" : "w-full"
          } bg-[#F4F3EC] rounded-none shadow px-6 py-23 flex flex-col transition-all duration-300 h-full`}
        >
          <h1 className="text-[40px] mb-3">Orders</h1>
          {orders.length > 0 && (
            <p className="text-green-600 text-sm mb-2">
              Found {orders.length} orders
            </p>
          )}
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="bg-[#F4F3EC] border-b border-black">
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 py-8">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-100 transition-all"
                    >
                      <td className="p-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={selectOrders.includes(order.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleOrder(order.id);
                            }}
                          />
                          #{index + 1}
                        </label>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        {order.customerImage && (
                          <img
                            src={order.customerImage}
                            alt={order.customer}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span>{order.customer}</span>
                      </td>
                      <td className="p-4">{order.type}</td>
                      <td className="p-4 text-red-500">{order.status}</td>
                      <td className="p-4">${Number(order.total).toFixed(2)}</td>
                      <td className="p-4 flex gap-2 items-center">
                        {new Date(order.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                        <button
                          className="text-blue-800 ml-3 cursor-pointer underline text-xs"
                          onClick={() => {
                            setPreviewMode(false);
                            setLoadingPreview(false);
                            setViewOrder({ ...order, index: index + 1 });
                          }}
                        >
                          Know Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectOrders.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-fadeIn z-50">
              <div className="bg-[#EEEAE2] shadow-xl rounded-xl px-6 py-3 flex gap-4 border border-gray-300">
                <button
                  onClick={handleImport}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition"
                >
                  Import (Mark as Packed)
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md transition"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Order Details */}
        {viewOrder && !previewMode && !loadingPreview && (
          <div className="w-1/3 h-full bg-white p-6 shadow overflow-y-auto relative">
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-red-600 cursor-pointer text-2xl font-bold"
              onClick={() => setViewOrder(null)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-1">
              Order #{viewOrder.index}
            </h2>
            <p className="inline-block px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold mb-4">
              {viewOrder.status?.charAt(0).toUpperCase() +
                viewOrder.status?.slice(1)}
            </p>
            <div className="flex flex-col items-center mb-6">
              {viewOrder.customerImage && (
                <img
                  src={viewOrder.customerImage}
                  alt={viewOrder.customer}
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
              )}
              <p className="font-semibold text-lg text-center">
                {viewOrder.customer}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 text-sm space-y-2">
              <p>
                <strong>Payment:</strong> {viewOrder.paymentMethod}
              </p>
              <p>
                <strong>Address:</strong> {viewOrder.address}
              </p>
              <p>
                <strong>Order Type:</strong> {viewOrder.type}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(viewOrder.date).toLocaleString()}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {viewOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right text-lg font-bold">
                Total: ${viewOrder.total}
              </div>
            </div>
            <button
              className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              onClick={handlePreviewPackaging}
            >
              Preview Packaging
            </button>
          </div>
        )}

        {/* Loading Animation */}
        {viewOrder && loadingPreview && (
          <div className="w-1/3 h-full bg-white flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
              }}
              className="text-xl font-semibold text-blue-700"
            >
              Analyzing...
            </motion.div>
            <motion.div
              className="w-10 h-10 mt-4 border-4 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ borderTopColor: "transparent", borderRadius: "50%" }}
            />
          </div>
        )}

        {/* 3D Preview */}
        {isGenerating && (
          <div className="w-1/3 h-full bg-black flex flex-col items-center justify-center text-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold"
            >
              Generating
            </motion.div>
            <motion.div className="flex mt-2 space-x-1 text-3xl font-bold">
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              >
                .
              </motion.span>
            </motion.div>
          </div>
        )}

        {/* 3D Preview */}
        {viewOrder && previewMode && !isGenerating && (
          <div className="w-1/3 h-full bg-black text-white p-2 flex flex-col relative overflow-hidden">
            <button
              className="absolute cursor-pointer top-2 right-4 text-white text-2xl font-bold hover:text-red-500"
              onClick={() => setPreviewMode(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-1">3D Model</h2>
            <hr className="border-gray-500 mb-3" />
            <div className="flex flex-1 w-full">
              <div className="flex-1 h-full bg-black">
                <ThreeDBox />
              </div>
              <div className="h-full p-3 flex flex-col gap-4 items-center justify-center shadow-inner">
                {viewOrder?.items?.map((item, index) => (
                  <img
                    key={index}
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover cursor-pointer rounded-full border border-white shadow"
                    title={item.name}
                  />
                ))}
              </div>
            </div>
           <div className="text-sm space-y-2 -mt-10">
  {mlResponse ? (
    mlResponse.error ? (
      <p className="text-red-400">{mlResponse.error}</p>
    ) : (
      <>
        <p><strong>Box Dimensions:</strong> {mlResponse.Box_Dimensions || "N/A"}</p>
        <p><strong>Box Category:</strong> {mlResponse.Box_Category || "N/A"}</p>
        <p><strong>Weather Recommendation:</strong> {mlResponse.Weather_Recommendation || "N/A"}</p>
        <p><strong>Environmental Impact:</strong> Plastic saved: {mlResponse.Environmental_Impact.Plastic_Saved_kg || "0"}kg <br /> <span className="ml-37">CO₂ saved: {mlResponse.Environmental_Impact.CO2_Saved_kg || "0"}kg</span></p>
        <p><strong>Filler Type:</strong> {mlResponse.Filler_Type || "N/A"}</p>
        <p><strong>Filler Amount:</strong> {mlResponse.Filler_Amount || "N/A"}</p>
        <p><strong>Cost Saved(Per unit):</strong> {mlResponse.Cost_Savings_Per_Unit || "N/A"}</p>
      </>
    )
  ) : (
    <p className="text-gray-400">Fetching ML Recommendations...</p>
  )}
</div>
            <button
              className="bg-white cursor-pointer text-black px-4 py-2 rounded hover:bg-gray-200 mt-4"
              onClick={handleGoToBoxDisplay}
            >
              Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
