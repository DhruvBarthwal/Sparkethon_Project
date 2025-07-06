import React from "react";

const OrderStatus = ({ paidPercent, cancelledPercent }) => {
  return (
    <div className="status p-5">
      <h1 className="font-semibold">ORDER STATUS</h1>
      <div className="progress w-[430px] h-[10px] bg-green-500 mt-[20px]"></div>
      <div className="mt-[20px]">
        <div className="flex justify-between">
          <div className="flex items-center gap-[7px]">
            <div className="bg-green-500 h-[8px] w-[8px] mb-[2px]"></div>
            <h1>Paid</h1>
          </div>
          <div className="mr-[8px]">
            <h1>{paidPercent}%</h1>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-[7px]">
            <div className="bg-red-500 h-[8px] w-[8px] mb-[2px]"></div>
            <h1>Cancelled</h1>
          </div>
          <div className="mr-[8px]">
            <h1>{cancelledPercent}%</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;