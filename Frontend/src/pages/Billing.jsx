import React, { useState, useEffect } from "react";
import { getItems, createOrder, finalizeOrder, downloadInvoice } from "../services/api";

const Billing = () => {
  // --- STATE MANAGEMENT ---
  const [items, setItems] = useState([]);          // Full catalog
  const [cart, setCart] = useState([]);            // Current bill items
  const [partyName, setPartyName] = useState("");  // Customer Name
  const [searchTerm, setSearchTerm] = useState("");// Search Bar
  const [loading, setLoading] = useState(false);   // Processing state

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const result = await getItems();
      // Filter: We only show "PACKET" items for sale, not the bulk sacks
      setItems(result.data.filter(i => i.type === "PACKET"));
    } catch (error) {
      console.error("Error loading catalog:", error);
    }
  };

  // --- CART ACTIONS ---
  const addToCart = (item) => {
    const existing = cart.find(c => c.itemId === item.id);
    if (existing) {
      // If exists, just increment qty
      setCart(cart.map(c => c.itemId === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      // Add new item to cart
      setCart([...cart, { 
        itemId: item.id, 
        name: item.name, 
        price: item.price, 
        qty: 1, 
        sourceId: item.sourceId, 
        weightMultiplier: item.weightMultiplier 
      }]);
    }
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) {
      // Remove item if qty drops to 0
      setCart(cart.filter(c => c.itemId !== id));
    } else {
      setCart(cart.map(c => c.itemId === id ? { ...c, qty: parseInt(newQty) } : c));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  // --- CORE CHECKOUT LOGIC (Order + Stock + PDF) ---
  const handleCheckout = async () => {
    if (!partyName.trim()) return alert("⚠️ Please enter a Party Name!");
    if (cart.length === 0) return alert("⚠️ Cart is empty!");
    
    setLoading(true);

    try {
      // Step 1: Create the Draft Order
      const orderPayload = {
        partyName: partyName,
        totalAmount: calculateTotal(),
        items: cart
      };
      
      const createResponse = await createOrder(orderPayload);
      const orderId = createResponse.data.id;
      const readableId = createResponse.data.readableOrderId;

      // Step 2: Finalize (Deduct Stock on Backend)
      await finalizeOrder(orderId);

      // Step 3: Download PDF Invoice automatically
      const pdfResponse = await downloadInvoice(orderId);
      
      // Create a Blob from the PDF Stream
      const file = new Blob([pdfResponse.data], { type: 'application/pdf' });
      
      // Build a URL for it
      const fileURL = window.URL.createObjectURL(file);
      
      // Create a hidden link to force download
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', `Invoice_${readableId}.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();
      
      // Clean up
      window.URL.revokeObjectURL(fileURL);
      document.body.removeChild(fileLink);

      // Success Reset
      alert(`✅ Order #${readableId} Finalized & Invoice Downloaded!`);
      setCart([]);
      setPartyName("");

    } catch (error) {
      console.error("Checkout failed:", error);
      const msg = error.response?.data?.message || "Stock Error or Backend Offline";
      alert("❌ Transaction Failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT SECTION: PRODUCT CATALOG --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-dark tracking-tight">Billing Terminal</h2>
              <p className="text-muted text-sm">Select items to build an order.</p>
            </div>
            <input 
              type="text" 
              placeholder="🔍 Search items..." 
              className="bg-white border border-gray-200 rounded-full px-5 py-2 w-full md:w-64 focus:ring-2 focus:ring-primary focus:outline-none transition shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Grid of Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
                onClick={() => addToCart(item)}
              >
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                  Retail Pack
                </div>
                <h3 className="font-semibold text-dark text-lg leading-tight mb-3 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                
                <div className="flex justify-between items-end mt-2 border-t border-gray-50 pt-3">
                   <div className="flex flex-col">
                     <span className="text-xs text-muted">Price</span>
                     <span className="text-xl font-bold text-dark">₹{item.price}</span>
                   </div>
                   <button className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-primary hover:text-white transition">
                     +
                   </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted">
              No items found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* --- RIGHT SECTION: CART & CHECKOUT --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sticky top-24 border border-gray-100">
            
            <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
              <span>🛒 Current Order</span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{cart.length} items</span>
            </h3>
            
            {/* Party Input */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Customer / Party Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-medium text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                placeholder="e.g. Gupta Store"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
              />
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-muted font-medium">Cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Click items on the left to add</p>
                </div>
              ) : cart.map(item => (
                <div key={item.itemId} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition group">
                  <div>
                    <div className="font-medium text-dark text-sm">{item.name}</div>
                    <div className="text-xs text-muted mt-0.5">₹{item.price} x {item.qty}</div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                     <button 
                        onClick={(e) => { e.stopPropagation(); updateQty(item.itemId, item.qty - 1); }} 
                        className="text-gray-400 hover:text-red-500 font-bold px-1 transition"
                     >-</button>
                     <span className="font-semibold text-dark w-4 text-center text-sm">{item.qty}</span>
                     <button 
                        onClick={(e) => { e.stopPropagation(); updateQty(item.itemId, item.qty + 1); }} 
                        className="text-gray-400 hover:text-green-600 font-bold px-1 transition"
                     >+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Action */}
            <div className="border-t border-gray-100 pt-6 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted text-sm font-medium">Subtotal</span>
                <span className="text-dark font-medium">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-dark font-bold text-lg">Total Payable</span>
                <span className="text-3xl font-bold text-primary">₹{calculateTotal()}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primaryHover'}`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  <>✓ Finalize & Print Bill</>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Billing;