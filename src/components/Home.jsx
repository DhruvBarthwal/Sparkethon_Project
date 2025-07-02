import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";
import Dashboard from "./Dashboard";
import BoxDisplay from "./BoxDisplay";

const Home = () => {
  const [orders, setOrders] = useState([]);
  const [selectOrders, setSelectOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [importedStats, setImportedStats] = useState(() => ({
    total: Number(localStorage.getItem("importedTotalOrders")) || 0,
    revenue: Number(localStorage.getItem("importedTotalRevenue")) || 0,
    paid: Number(localStorage.getItem("importedPaidOrders")) || 0,
    cancelled: Number(localStorage.getItem("importedCancelledOrders")) || 0,
    pending: Number(localStorage.getItem("importedPendingOrders")) || 0,
  }));

  const radius = 50;
  const circumference = Math.PI * radius;
  const paidPercent =
    importedStats.total > 0
      ? ((importedStats.paid / importedStats.total) * 100).toFixed(0)
      : 0;
  const cancelledPercent =
    importedStats.total > 0
      ? ((importedStats.cancelled / importedStats.total) * 100).toFixed(0)
      : 0;
  const rejectRate =
    importedStats.total > 0
      ? ((importedStats.cancelled / importedStats.total) * 100).toFixed(1)
      : 0;
  const offset = circumference - (paidPercent / 100) * circumference;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const liveOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(liveOrders);
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
    if (viewOrder && selectOrders.includes(viewOrder.id)) {
      setViewOrder(null); // Hide the BoxDisplay
    }
    setSelectOrders([]);
  };

  const handleDelete = async () => {
    for (const id of selectOrders) {
      await deleteDoc(doc(db, "orders", id));
    }
    if (viewOrder && selectOrders.includes(viewOrder.id)) {
      setViewOrder(null); // Hide the BoxDisplay
    }
    setSelectOrders([]);
  };

  const pendingOrders = orders?.length || 0;
  const pendingRevenue = orders.reduce(
    (acc, order) => acc + Number(order.total || 0),
    0
  );

  return (
    <div className="main-container h-[calc(100vh-80px)] w-full px-8 pt-3 flex flex-col">
      <div className="flex w-full gap-6 flex-1 overflow-hidden relative">
        {/* Orders Table */}
        <div className="w-2/3 h-[620px] relative bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-6 py-4 flex flex-col">
          <h1 className="text-[40px] mb-3">Orders</h1>

          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...orders]
                  .filter((o) => o.customer && o.total && o.date)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((order, index) => (
                    <tr
                      key={order.id}
                      onClick={() => setViewOrder(order)}
                      className="cursor-pointer hover:bg-gray-100 transition-all"
                    >
                      <td className="p-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 mb-[2px]"
                            checked={selectOrders.includes(order.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleOrder(order.id);
                            }}
                          />
                          #{index + 1}
                        </label>
                      </td>
                      <td className="p-4">{order.customer}</td>
                      <td className="p-4">{order.type}</td>
                      <td className="p-4">{order.status}</td>
                      <td className="p-4">${Number(order.total).toFixed(2)}</td>
                      <td className="p-4">
                        {new Date(order.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {selectOrders.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-fadeIn z-50">
              <div className="bg-[#EEEAE2] shadow-xl rounded-xl px-6 py-3 flex gap-4 border border-gray-300">
                <button
                  onClick={handleImport}
                  className="	bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition"
                >
                  Import (Mark as Packed)
                </button>
                <button
                  onClick={handleDelete}
                  className="	bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md transition"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <Dashboard
          stats={importedStats}
          offset={offset}
          circumference={circumference}
          paidPercent={paidPercent}
          cancelledPercent={cancelledPercent}
          rejectRate={rejectRate}
          pendingOrders={pendingOrders}
          pendingRevenue={pendingRevenue}
        />

        {/* BoxDisplay Panel */}
        {viewOrder && (
          <BoxDisplay
            key={viewOrder.id}
            order={viewOrder}
            onClose={() => setViewOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
