import React, { useState, useEffect } from "react";
import { getItems, createOrder, finalizeOrder, downloadInvoice } from "../services/api";
import html2canvas from "html2canvas";
import { ReceiptTemplate } from "../components/ReceiptTemplate";

const Billing = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [partyName, setPartyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // We need this to render the hidden receipt for Image generation
  const [lastOrder, setLastOrder] = useState(null);
  
  // Track which button is loading specificially
  const [loadingType, setLoadingType] = useState(null); // 'PDF' or 'IMAGE' or null

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const result = await getItems();
      // Filter out BULK items, show only packets/boxes
      const retailItems = result.data.filter(i => i.type !== "BULK");
      setItems(retailItems);
    } catch (error) {
      console.error("Error loading catalog:", error);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find((x) => x.itemId === item.id);
    if (existing) {
      setCart(cart.map((x) => (x.itemId === item.id ? { ...x, qty: x.qty + 1 } : x)));
    } else {
      setCart([...cart, { itemId: item.id, name: item.name, price: item.price, qty: 1, weightMultiplier: item.weightMultiplier, sourceId: item.sourceId }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((x) => x.itemId !== itemId));
  };

  const updateQty = (itemId, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map((x) => (x.itemId === itemId ? { ...x, qty: parseInt(newQty) } : x)));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // --- UNIFIED CHECKOUT HANDLER ---
  const handleCheckout = async (type) => {
    if (!partyName.trim()) return alert("⚠️ Please enter Customer Name");
    if (cart.length === 0) return alert("⚠️ Cart is empty");

    setLoadingType(type); // Start Loading Spinner on specific button

    try {
      // 1. Create & Finalize Order in Backend
      const orderPayload = {
        partyName,
        items: cart,
        totalAmount: calculateTotal(),
      };

      const createdOrder = await createOrder(orderPayload);
      const orderId = createdOrder.data.id;
      const readableId = createdOrder.data.readableOrderId;

      await finalizeOrder(orderId);

      // 2. Handle The Output (PDF or Image)
      if (type === 'PDF') {
        // --- PDF FLOW ---
        const pdfResponse = await downloadInvoice(orderId);
        const file = new Blob([pdfResponse.data], { type: 'application/pdf' });
        const fileURL = window.URL.createObjectURL(file);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', `Invoice_${readableId}.pdf`);
        document.body.appendChild(fileLink);
        fileLink.click();
        
      } else if (type === 'IMAGE') {
        // --- IMAGE FLOW ---
        // Setup data for the hidden component
        setLastOrder({
            readableId: readableId,
            partyName: partyName,
            items: cart,
            totalAmount: calculateTotal()
        });
        
        // Wait 500ms for React to render the hidden receipt, then snap it
        setTimeout(() => downloadAsImage(readableId), 500);
      }

      // 3. Cleanup
      if (type === 'PDF') {
          // For PDF we can clear immediately. 
          // For Image, we wait a bit so the data exists for the snapshot
          setCart([]);
          setPartyName("");
      } else {
          // Clear after the snapshot is likely taken
          setTimeout(() => {
             setCart([]);
             setPartyName("");
          }, 1000);
      }
      
      // Success Message (Optional, maybe just a toast)
      // alert(`✅ Order ${readableId} Finalized!`);

    } catch (error) {
      console.error("Checkout failed:", error);
      alert("❌ Transaction Failed. Check console.");
    } finally {
      setLoadingType(null); // Stop Loading
    }
  };

  const downloadAsImage = async (filenameId) => {
    const element = document.getElementById("receipt-hidden");
    if (!element) return;
    try {
      const canvas = await html2canvas(element);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Receipt_${filenameId || "New"}.png`;
      link.click();
    } catch (error) { console.error("Image generation failed", error); }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT SECTION: PRODUCT CATALOG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-xl font-bold text-dark">Billing Terminal</h1>
            <input 
              type="text" 
              placeholder="🔍 Search items..." 
              className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted">No items found.</div>
            ) : filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary cursor-pointer transition-all flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-dark text-sm leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-muted">{item.weightMultiplier} kg</p>
                </div>
                <div className="mt-3 text-right">
                  <span className="block font-bold text-primary">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION: CART & CHECKOUT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
            
            <div className="bg-primary p-4 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                Current Order
              </h2>
            </div>

            <div className="p-4 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Cart is empty</p>
                </div>
              ) : cart.map((item) => (
                <div key={item.itemId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-dark">{item.name}</p>
                    <p className="text-xs text-muted">₹{item.price} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-md">
                      <button onClick={() => updateQty(item.itemId, item.qty - 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-l">-</button>
                      <span className="px-2 text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.itemId, item.qty + 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-r">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.itemId)} className="text-red-400 hover:text-red-600">
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-dark">₹{calculateTotal()}</span>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  placeholder="Customer Name / Mobile"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                />
                
                {/* --- NEW: DUAL BUTTONS --- */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Button 1: PDF */}
                  <button 
                    onClick={() => handleCheckout('PDF')}
                    disabled={loadingType !== null}
                    className={`py-3 rounded-lg font-bold text-white shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${
                      loadingType ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {loadingType === 'PDF' ? (
                      "Saving..."
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        PDF
                      </>
                    )}
                  </button>

                  {/* Button 2: Image */}
                  <button 
                    onClick={() => handleCheckout('IMAGE')}
                    disabled={loadingType !== null}
                    className={`py-3 rounded-lg font-bold text-white shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${
                      loadingType ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {loadingType === 'IMAGE' ? (
                      "Saving..."
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        Image
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Hidden Receipt for Screenshot */}
      {lastOrder && <ReceiptTemplate order={lastOrder} id="receipt-hidden" />}
    </div>
  );
};

export default Billing;