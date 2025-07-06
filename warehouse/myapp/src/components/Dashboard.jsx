import React from "react";
import ArcProgress from "./ArcProgress";
import OrderStatus from "./OrderStatus";
import Overview from "./Overview";

const Dashboard = ({
  stats,
  offset,
  circumference,
  paidPercent,
  cancelledPercent,
  rejectRate,
  pendingOrders,
  pendingRevenue
}) => {
  return (
    <div className="w-1/3 h-[620px] bg-white rounded-2xl pt-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[15px] pl-5 font-semibold mb-4">RECEIPT OF GOODS</h2>
      <ArcProgress
        paidOrders={stats.paid}
        totalOrders={stats.total}
        offset={offset}
        circumference={circumference}
      />
      <div className="mt-[20px] w-full border-[1px] border-gray-300"></div>
      <OrderStatus
        paidPercent={paidPercent}
        cancelledPercent={cancelledPercent}
      />
      <div className="mt-[20px] w-full border-[1px] border-gray-300"></div>
      <Overview
        stats={stats}
        rejectRate={rejectRate}
        pendingOrders={pendingOrders}
        pendingRevenue={pendingRevenue}
      />
    </div>
  );
};

export default Dashboard;