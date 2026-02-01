import React from "react";

// This ID 'printable-receipt' is crucial for the snapshot tool
export const ReceiptTemplate = ({ order, id }) => {
  if (!order || !order.items) return null;

  return (
    <div 
      id={id} 
      style={{
        width: "400px", 
        padding: "20px", 
        backgroundColor: "white", 
        color: "black",
        fontFamily: "Courier New, monospace", // Thermal printer look
        position: "absolute", 
        top: "-9999px", // Hide it off-screen
        left: "-9999px" 
      }}
    >
      <div style={{textAlign: "center", marginBottom: "20px"}}>
        <h2 style={{margin: 0, fontSize: "24px", fontWeight: "bold"}}>{order.partyName}</h2>
        <p style={{margin: 0, fontSize: "12px"}}>{new Date().toLocaleDateString()}</p>
        <hr style={{borderTop: "1px dashed black", margin: "10px 0"}}/>
      </div>

      {/* <div style={{fontSize: "14px", marginBottom: "10px"}}>
        <p style={{margin: "2px 0"}}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p style={{margin: "2px 0"}}><strong>Order #:</strong> {order.readableId || "N/A"}</p>
        <p style={{margin: "2px 0"}}><strong>Customer:</strong> {order.partyName}</p>
      </div> */}

      <table style={{width: "100%", fontSize: "14px", borderCollapse: "collapse"}}>
        <thead>
          <tr>
            <th style={{textAlign: "left"}}>Item</th>
            <th style={{textAlign: "right"}}>Qty</th>
            <th style={{textAlign: "right"}}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td style={{padding: "4px 4px"}}>{item.name}</td>
              <td style={{textAlign: "right"}}>{item.qty}</td>
              <td style={{textAlign: "right"}}>{item.qty * item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{borderTop: "1px dashed black", margin: "15px 0"}}/>

      <div style={{textAlign: "right", fontSize: "18px", fontWeight: "bold"}}>
        TOTAL: Rs {order.totalAmount}
      </div>
      
      {/* <div style={{textAlign: "center", marginTop: "20px", fontSize: "12px"}}>
        <p>Thank you for your business!</p>
      </div> */}
    </div>
  );
};