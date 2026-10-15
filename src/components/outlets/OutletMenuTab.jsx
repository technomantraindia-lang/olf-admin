import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Layers,
  ChefHat,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  menuService,
  MENU_CATEGORIES,
  CUISINE_TYPES,
  DIETARY_TYPES,
} from '../../services/menuService';

export default function OutletMenuTab({ outlet = {}, isApproved = true }) {
  const targetOutletId = outlet?.id || 'OUTLET';
  const targetMealType = outlet?.mealType || 'VEG_AND_NON_VEG';

  const [items, setItems] = useState(() =>
    menuService.getMenuByOutlet(targetOutletId, targetMealType)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDietary, setSelectedDietary] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ENABLED' | 'DISABLED'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Thali & Meals',
    cuisine: 'NORTH_INDIAN',
    dietary: 'VEG',
    basePrice: '',
    gstRate: '0.05',
    preparationTime: '15',
    packagingCharges: '10',
    description: '',
    image: '',
  });

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesId && !matchesDesc) return false;
      }

      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
        return false;
      }

      if (selectedDietary !== 'ALL' && item.dietary !== selectedDietary) {
        return false;
      }

      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedDietary, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const enabled = items.filter((i) => i.status === 'ENABLED').length;
    const disabled = items.filter((i) => i.status === 'DISABLED').length;
    const vegCount = items.filter((i) => i.dietary === 'VEG' || i.dietary === 'JAIN').length;
    return { total, enabled, disabled, vegCount };
  }, [items]);

  // Availability Toggle
  const handleToggleStatus = (item) => {
    const nextStatus = menuService.toggleItemStatus(targetOutletId, item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    showToast(
      nextStatus === 'ENABLED'
        ? `"${item.name}" is now Available on IRCTC passenger app.`
        : `"${item.name}" marked as Sold Out (paused).`
    );
  };

  // Delete Item
  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from the menu?`)) {
      menuService.deleteMenuItem(targetOutletId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Item "${item.name}" removed from menu.`);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Thali & Meals',
      cuisine: 'NORTH_INDIAN',
      dietary: targetMealType === 'PURE_VEG' ? 'VEG' : 'VEG',
      basePrice: '',
      gstRate: '0.05',
      preparationTime: '15',
      packagingCharges: '10',
      description: '',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Thali & Meals',
      cuisine: item.cuisine || 'NORTH_INDIAN',
      dietary: item.dietary || 'VEG',
      basePrice: String(item.basePrice || ''),
      gstRate: String(item.gstRate !== undefined ? item.gstRate : '0.05'),
      preparationTime: String(item.preparationTime || '15'),
      packagingCharges: String(item.packagingCharges || '10'),
      description: item.description || '',
      image: item.image || '',
    });
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.basePrice) {
      alert('Please provide item name and base price.');
      return;
    }

    if (editingItem) {
      // Update
      const updated = menuService.updateMenuItem(targetOutletId, editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        cuisine: formData.cuisine,
        dietary: formData.dietary,
        basePrice: Number(formData.basePrice),
        gstRate: Number(formData.gstRate),
        preparationTime: Number(formData.preparationTime),
        packagingCharges: Number(formData.packagingCharges),
        description: formData.description.trim(),
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      });
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      showToast(`"${formData.name}" updated successfully.`);
    } else {
      // Create
      const created = menuService.addMenuItem(targetOutletId, {
        name: formData.name.trim(),
        category: formData.category,
        cuisine: formData.cuisine,
        dietary: formData.dietary,
        basePrice: Number(formData.basePrice),
        gstRate: Number(formData.gstRate),
        preparationTime: Number(formData.preparationTime),
        packagingCharges: Number(formData.packagingCharges),
        description: formData.description.trim(),
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        status: 'ENABLED',
      });
      setItems((prev) => [created, ...prev]);
      showToast(`New dish "${formData.name}" added to menu.`);
    }

    setIsModalOpen(false);
  };

  // Quick Dietary Badge Component
  const renderDietaryBadge = (dietary) => {
    const isVeg = dietary === 'VEG' || dietary === 'JAIN';
    const isJain = dietary === 'JAIN';
    const isEgg = dietary === 'EGG';

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${
          isJain
            ? 'bg-teal-50 text-teal-700 border-teal-200'
            : isVeg
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isEgg
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isJain
              ? 'bg-teal-600'
              : isVeg
              ? 'bg-emerald-600'
              : isEgg
              ? 'bg-amber-600'
              : 'bg-rose-600'
          }`}
        />
        <span>
          {isJain ? 'Jain Food' : isVeg ? 'Pure Veg' : isEgg ? 'Contains Egg' : 'Non-Veg'}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Station Restaurant Food Menu & Pricing
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              IRCTC v3 Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage food dishes, passenger base prices, GST tax rates, and live instant Sold-Out toggles for{' '}
            <strong className="text-slate-800">{outlet?.name || 'This Restaurant'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Dishes
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all categories</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live / Available
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.enabled}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Bookable by train passengers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Sold Out / Paused
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{metrics.disabled}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Hidden from passenger view</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Veg & Jain Dishes
          </div>
          <div className="text-2xl font-black text-teal-800 mt-1">{metrics.vegCount}</div>
          <div className="text-[11px] text-teal-600/80 mt-0.5">100% Green certified</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name, ID, or cuisine..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedDietary('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedDietary === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('VEG')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedDietary === 'VEG'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Veg
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('NON_VEG')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedDietary === 'NON_VEG'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Non-Veg
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('JAIN')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedDietary === 'JAIN'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Jain
            </button>

            {/* Availability filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Status</option>
              <option value="ENABLED">Available Only</option>
              <option value="DISABLED">Sold Out Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No dishes match your filter</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try clearing search queries or switching categories to view other items.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedDietary('ALL');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isAvailable = item.status === 'ENABLED';
            const gstAmount = (item.basePrice * (item.gstRate || 0.05)).toFixed(2);
            const finalPrice = (item.basePrice + Number(gstAmount)).toFixed(2);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  isAvailable ? 'border-slate-200' : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Food Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-[9px] font-black uppercase text-white bg-rose-600 px-1 py-0.5 rounded">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderDietaryBadge(item.dietary)}
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.isPopular && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          ★ Best Seller
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description || 'Authentic dish prepared fresh per passenger order.'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                      <span>ID: {item.id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Prep: {item.preparationTime || 15}m</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Pricing & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">
                        ₹{item.basePrice}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        + {(item.gstRate * 100).toFixed(0)}% GST
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Passenger pays: <strong className="text-slate-800">₹{finalPrice}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Sold Out Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      title={isAvailable ? 'Click to mark as Sold Out' : 'Click to mark as Available'}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-300'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-rose-600" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 rounded-md hover:bg-orange-50 transition cursor-pointer"
                      title="Edit dish details & price"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    IRCTC eCatering v3 Specifications (Domain 4)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish / Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Deluxe Executive Rail Thali"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Category & Dietary */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Food Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  >
                    {MENU_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dietary Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  >
                    {DIETARY_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Base Price & GST */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Base Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="10"
                      max="2000"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="180"
                      className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GST Tax Rate <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono"
                  >
                    <option value="0.00">0% (Rail Neer / Exempted)</option>
                    <option value="0.05">5% (Standard Restaurant Food)</option>
                    <option value="0.12">12% (Pre-packaged Sweets)</option>
                    <option value="0.18">18% (Aerated Drinks & Ice Creams)</option>
                  </select>
                </div>
              </div>

              {/* Prep time & Packaging */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kitchen Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Packaging Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.packagingCharges}
                    onChange={(e) => setFormData({ ...formData, packagingCharges: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish Description & Ingredients
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, items included in thali, bread type, portion size..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish Photo URL (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition"
                >
                  {editingItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
