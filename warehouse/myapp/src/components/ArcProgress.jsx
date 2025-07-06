import React from "react";

const ArcProgress = ({ paidOrders, totalOrders, offset, circumference }) => {
  return (
    <div className="flex justify-center relative">
      <svg width="180" height="150" viewBox="0 0 120 60">
        <path
          d="M10,60 A50,50 0 0,1 110,60"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
        />
        <path
          d="M110,60 A50,50 0 0,0 10,60"
          fill="none"
          stroke="#10B981"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute mt-[70px] flex justify-center flex-col items-center">
        <h1 className="mr-[5px] text-[22px] font-semibold">{paidOrders}</h1>
        <h1 className="text-[13px] text-gray-500">{totalOrders} Orders</h1>
      </div>
    </div>
  );
};

export default ArcProgress;