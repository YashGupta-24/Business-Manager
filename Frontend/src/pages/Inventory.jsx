import React, { useState, useEffect } from "react";
import { getItems, addItem } from "../services/api";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ 
    name: "", type: "BULK", stockQuantity: "", price: "", sourceId: "", weightMultiplier: "" 
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const result = await getItems();
      setItems(result.data);
    } catch (error) {
      console.error("Connection Error:", error);
    }
  };

  const handleSave = async () => {
    if (!newItem.name) return; 
    try {
      await addItem(newItem);
      loadItems(); 
      setNewItem({ name: "", type: "BULK", stockQuantity: "", price: "", sourceId: "", weightMultiplier: "" });
    } catch (error) {
      alert("Error adding item.");
    }
  };

  const bulkItems = items.filter(i => i.type === "BULK");

  return (
    <div className="min-h-screen bg-light p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-dark tracking-tight">Inventory</h1>
          <p className="text-muted mt-1">Manage bulk raw materials and retail packs.</p>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-lg font-medium text-dark mb-6">Add New Item</h2>
          
          {/* Responsive Grid: 1 col on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            
            {/* Name Input */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Item Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="e.g. Basmati Rice" 
                value={newItem.name} 
                onChange={(e) => setNewItem({...newItem, name: e.target.value})} 
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Type</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-primary transition"
                value={newItem.type} 
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
              >
                <option value="BULK">Bulk Source</option>
                <option value="PACKET">Retail Packet</option>
              </select>
            </div>

            {/* Dynamic Fields */}
            {newItem.type === "BULK" ? (
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Stock (kg)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="0" 
                  value={newItem.stockQuantity} 
                  onChange={(e) => setNewItem({...newItem, stockQuantity: e.target.value})} 
                />
              </div>
            ) : (
              <>
                <div>
                   <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Source</label>
                   <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-primary transition"
                      onChange={(e) => setNewItem({...newItem, sourceId: e.target.value})}
                   >
                      <option value="">Select Parent...</option>
                      {bulkItems.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div>
               {newItem.type === "PACKET" && (
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Weight (kg)</label>
                     <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3" placeholder="1.0" 
                        value={newItem.weightMultiplier} onChange={(e) => setNewItem({...newItem, weightMultiplier: e.target.value})} />
                  </div>
               )}
               <button 
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
               >
                  + Add Item
               </button>
            </div>

          </div>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
             <h3 className="text-lg font-medium text-dark">Current Stock</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wider border-b border-gray-50">
                  <th className="px-8 py-4 font-semibold">Item Name</th>
                  <th className="px-8 py-4 font-semibold">Category</th>
                  <th className="px-8 py-4 font-semibold">Status</th>
                  <th className="px-8 py-4 font-semibold text-right">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-muted">No items found.</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-medium text-dark">{item.name}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.type === "BULK" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      {item.type === "BULK" ? (
                        <span className="text-dark font-medium">{item.stockQuantity} kg</span>
                      ) : (
                        <span className="text-muted">Uses {item.weightMultiplier}kg parent</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right text-xs text-gray-400 font-mono">
                      {item.id.substring(item.id.length - 6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inventory;