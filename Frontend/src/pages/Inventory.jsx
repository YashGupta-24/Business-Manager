import React, { useState, useEffect } from "react";
import { getItems, addItem, deleteItem, addStock } from "../services/api";
import log from "../utils/logger";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("BULK"); // Tabs: BULK, PACKET, BOX
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
      log.debug("Successfully loaded inventory items:", result.data.length);
    } catch (error) {
      log.error("Connection Error while loading inventory:", error);
    }
  };

  const handleSave = async () => {
    // --- 1. VALIDATION LOGIC ---
    if (!newItem.name.trim()) return alert("⚠️ Item Name is required");

    // Bulk Validation
    if (newItem.type === "BULK") {
      if (!newItem.stockQuantity || newItem.stockQuantity <= 0) {
        return alert("⚠️ Bulk items must have initial Stock Quantity!");
      }
    }
    // Packet/Box Validation
    else {
      if (!newItem.price || newItem.price <= 0) return alert("⚠️ Price is required for selling items!");
      if (!newItem.sourceId) return alert("⚠️ Please select a Source (Bulk Item)!");
      if (!newItem.weightMultiplier) return alert("⚠️ Weight/Volume is required!");
    }

    // --- 2. CLEAN PAYLOAD (Remove unnecessary fields) ---
    const payload = { ...newItem };
    if (payload.type === "BULK") {
      // Bulk doesn't need sourceId, price, or weightMultiplier
      delete payload.sourceId;
      delete payload.price;
      delete payload.weightMultiplier;
    } else {
      // Packet/Box doesn't need raw stockQuantity (it's calculated)
      delete payload.stockQuantity;
    }

    try {
      await addItem(payload);
      alert("✅ Item Added Successfully!");
      loadItems();
      // Reset Form
      setNewItem({ name: "", type: "BULK", stockQuantity: "", price: "", sourceId: "", weightMultiplier: "" });
      log.info(`Successfully added new inventory item: ${payload.name} (${payload.type})`);
    } catch (error) {
      log.error("Error adding inventory item:", error);
      alert("❌ Error adding item.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteItem(id);
        // Optimistic update: Remove it from UI immediately
        setItems(items.filter(item => item.id !== id));
        log.info(`Successfully deleted item ID: ${id}`);
      } catch (error) {
        log.error("Error deleting item:", error);
        alert("Failed to delete item. It might be linked to active orders.");
      }
    }
  };

  const handleRestock = async (item) => {
    // 1. Ask the user for the new quantity
    const addedQty = prompt(`How much extra "${item.name}" did you purchase? (in kg)`);

    // 2. Safety Checks
    if (!addedQty) return; // User cancelled
    const quantity = parseFloat(addedQty);
    if (isNaN(quantity) || quantity <= 0) return alert("⚠️ Please enter a valid number!");

    try {
      // 3. Send to Backend
      await addStock(item.id, quantity);

      // 4. Update UI instantly (Math in frontend to look fast)
      setItems(items.map(i =>
        i.id === item.id
          ? { ...i, stockQuantity: i.stockQuantity + quantity }
          : i
      ));

      alert(`✅ Stock Updated! New Total: ${item.stockQuantity + quantity} kg`);
      log.info(`Restocked item: ${item.name} by ${quantity} units`);
    } catch (error) {
      log.error("Failed to update stock:", error);
      alert("❌ Failed to update stock.");
    }
  };

  // Helper to filter list by current tab
  const getFilteredItems = () => items.filter(i => i.type === activeTab);

  // Helper to get Bulk items for the dropdown
  const bulkOptions = items.filter(i => i.type === "BULK");

  return (
    <div className="min-h-screen bg-light p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark tracking-tight">Inventory Manager</h1>
          <p className="text-muted mt-1">Add items and track stock levels.</p>
        </div>

        {/* --- ADD ITEM FORM --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-dark mb-6">Add New Item</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

            {/* Name */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Item Name</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                placeholder="e.g. Basmati Rice"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>

            {/* Type Selection */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Type</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              >
                <option value="BULK">Bulk Source</option>
                <option value="PACKET">Packet</option>
                <option value="BOX">Box</option>
              </select>
            </div>

            {/* CONDITIONAL INPUTS */}
            {newItem.type === "BULK" ? (
              // BULK FIELDS
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Initial Stock (kg)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 50"
                  value={newItem.stockQuantity}
                  onChange={(e) => setNewItem({ ...newItem, stockQuantity: e.target.value })}
                />
              </div>
            ) : (
              // PACKET/BOX FIELDS
              <>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 90"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 1.0"
                    value={newItem.weightMultiplier}
                    onChange={(e) => setNewItem({ ...newItem, weightMultiplier: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Source Item</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    onChange={(e) => setNewItem({ ...newItem, sourceId: e.target.value })}
                  >
                    <option value="">Select Bulk...</option>
                    {bulkOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="col-span-7 text-right mt-4">
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primaryHover font-medium py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
              >+ Add to Inventory
              </button>
            </div>

          </div>
        </div>

        {/* --- TABS SYSTEM --- */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {["BULK", "PACKET", "BOX"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-dark"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- ITEMS TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-muted text-xs uppercase tracking-wider">
                <th className="px-8 py-4 font-bold">Item Name</th>
                <th className="px-8 py-4 font-bold">Details</th>
                <th className="px-8 py-4 font-bold text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* ... inside <tbody> ... */}
              {getFilteredItems().map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5 font-medium text-dark">{item.name}</td>

                  <td className="px-8 py-5 text-sm text-muted">
                    {item.type === "BULK" ? (
                      <span>{item.stockQuantity} kg Available</span>
                    ) : (
                      <span>
                        Price: <strong className="text-dark">₹{item.price}</strong> •
                        Weight: {item.weightMultiplier}kg
                      </span>
                    )}
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      {item.type === "BULK" && (
                        <button
                          onClick={() => handleRestock(item)}
                          className="p-2 text-primary bg-indigo-50 hover:bg-primary hover:text-white rounded-full transition-all shadow-sm"
                          title="Add Stock (Purchase)"
                        >
                          {/* Plus Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      )}

                      {/* DUSTBIN ICON (Visible on Hover) */}
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Delete Item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Inventory;