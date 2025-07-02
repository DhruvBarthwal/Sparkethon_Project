import React, { useState, useEffect } from "react";

const BoxDisplay = ({ order, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-[#fafffe] z-50 shadow-xl
        rounded-tl-2xl rounded-bl-2xl transform transition-transform duration-500 ease-in-out mr-[5px]
        ${visible ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="p-6 flex flex-col h-full overflow-y-auto">
        {/* Header with Close */}
        <div className="relative mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 mt-[-10px] mr-[-10px] bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <img
              src="/remove.png"
              alt="Close"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </button>
        </div>

        {/* Order Not Found */}
        {!order ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <img
              src="/no-order.png"
              alt="No order"
              className="w-32 h-32 mb-4"
            />
            <p className="text-lg font-semibold">Select an order</p>
          </div>
        ) : (
          <>
            {/* 3D Model Box Placeholder */}
            <div className="border-2 border-gray-300 rounded-lg flex justify-center items-center mx-auto mt-6 w-[90%] h-[200px] sm:h-[300px] md:h-[350px]">
              3D - MODEL
            </div>

            {/* Order Details */}
            <div className="space-y-2 text-gray-700 text-sm sm:text-base mt-6">
              <p>
                <strong>Customer:</strong> {order.customer}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Type:</strong> {order.type}
              </p>
              <p>
                <strong>Total:</strong> ${Number(order.total).toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BoxDisplay;
