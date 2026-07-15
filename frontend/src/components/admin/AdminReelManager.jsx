import React, { useEffect, useState } from "react";
import {
  FiEdit2,
  FiExternalLink,
  FiInstagram,
  FiPlus,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminAPI, reelsAPI } from "../../services/api";

const emptyForm = {
  title: "",
  reelUrl: "",
  embedUrl: "",
  videoUrl: "",
  thumbnailUrl: "",
  caption: "",
  category: "Fashion",
  username: "@luxe.atelier",
  audioName: "Original audio",
  viewsLabel: "",
  likesLabel: "",
  commentsLabel: "",
  product: "",
  displayOrder: 0,
  isActive: true,
};

const AdminReelManager = () => {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reels)) return data.reels;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data?.products)) return data.data.products;
    return [];
  };

  // Extract embed URL from Instagram Reel URL
  const extractReelId = (url) => {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const generateEmbedUrl = (reelUrl) => {
    const reelId = extractReelId(reelUrl);
    if (reelId) {
      return `https://www.instagram.com/reel/${reelId}/embed/captioned/`;
    }
    return "";
  };

  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await reelsAPI.getAdmin();
      const normalizedReels = normalizeArray(data);
      setReels(normalizedReels);

      // Save to localStorage as cache
      localStorage.setItem("luxe_admin_reels_cache", JSON.stringify(normalizedReels));
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error?.message || "Failed to load reels");

      // Fallback to localStorage
      const cachedReels = localStorage.getItem("luxe_admin_reels_cache");
      if (cachedReels) {
        try {
          const reelsData = JSON.parse(cachedReels);
          setReels(reelsData);
        } catch (parseError) {
          console.error("Parse error:", parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await adminAPI.products.getAll({ limit: 1000 });
      setProducts(normalizeArray(data));
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchReels();
    fetchProducts();
  }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (reel) => {
    setEditingId(reel._id || reel.id);

    setForm({
      title: reel.title || "",
      reelUrl: reel.reelUrl || "",
      embedUrl: reel.embedUrl || "",
      videoUrl: reel.videoUrl || "",
      thumbnailUrl: reel.thumbnailUrl || "",
      caption: reel.caption || "",
      category: reel.category || "Fashion",
      username: reel.username || "@luxe.atelier",
      audioName: reel.audioName || "Original audio",
      viewsLabel: reel.viewsLabel || "",
      likesLabel: reel.likesLabel || "",
      commentsLabel: reel.commentsLabel || "",
      product: reel.product?._id || reel.product || "",
      displayOrder: reel.displayOrder || 0,
      isActive: reel.isActive ?? true,
    });

    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.reelUrl.trim() && !form.videoUrl.trim()) {
      toast.error("Instagram Reel URL or Video URL is required");
      return;
    }

    try {
      const embedUrl = form.reelUrl ? generateEmbedUrl(form.reelUrl) : "";

      const payload = {
        ...form,
        embedUrl: embedUrl,
        product: form.product || null,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (editingId) {
        await reelsAPI.update(editingId, payload);
        toast.success("✅ Reel updated! Changes will appear on homepage");
      } else {
        await reelsAPI.create(payload);
        toast.success("✅ Reel added! It will appear on homepage");
      }

      resetForm();
      fetchReels(); // Refresh to get updated data from API
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to save reel");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this reel? It will be removed from homepage immediately."
      )
    )
      return;

    try {
      await reelsAPI.remove(id);

      // Update local state immediately
      const updatedReels = reels.filter((r) => (r._id || r.id) !== id);
      setReels(updatedReels);
      localStorage.setItem(
        "luxe_admin_reels_cache",
        JSON.stringify(updatedReels)
      );

      toast.success("✅ Reel deleted from homepage");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to delete reel");
    }
  };

  const handleToggle = async (id) => {
    try {
      // Update locally first for instant feedback
      const updatedReels = reels.map((r) => {
        if ((r._id || r.id) === id) {
          return { ...r, isActive: !r.isActive };
        }
        return r;
      });

      setReels(updatedReels);
      localStorage.setItem(
        "luxe_admin_reels_cache",
        JSON.stringify(updatedReels)
      );

      // Then sync with API
      await reelsAPI.toggle(id);

      const reel = updatedReels.find((r) => (r._id || r.id) === id);
      toast.success(
        reel.isActive
          ? "✅ Reel is now visible on homepage"
          : "✅ Reel hidden from homepage"
      );

      fetchReels(); // Refresh to confirm
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to update reel status");
      fetchReels(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════ HEADER SECTION ═══════════════ */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <FiInstagram size={24} />
              </div>
              Instagram Reels Manager
            </h2>
            <p className="text-white/80 mt-2 text-sm">
              Add real Instagram Reels or custom videos - They'll automatically appear on your homepage
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            <FiPlus size={18} />
            Add New Reel
          </button>
        </div>
      </div>

      {/* ═══════════════ ADD/EDIT FORM SECTION ═══════════════ */}
      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-6 md:p-8">
          <h3 className="font-black text-xl text-gray-900 mb-6">
            {editingId ? "✏️ Edit Reel" : "➕ Add New Reel"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instagram Reel URL */}
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                Instagram Reel URL (Optional)
              </label>
              <input
                type="url"
                value={form.reelUrl}
                onChange={(e) =>
                  setForm({ ...form, reelUrl: e.target.value })
                }
                placeholder="https://www.instagram.com/reel/Cxxxxxx/"
                className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                📌 Copy the full URL from Instagram reel or leave blank for custom video
              </p>
            </div>

            {/* Custom Video URL */}
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                Custom Video URL (Optional)
              </label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) =>
                  setForm({ ...form, videoUrl: e.target.value })
                }
                placeholder="https://example.com/video.mp4"
                className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                🎥 Upload your own MP4 video link (if not using Instagram reel)
              </p>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="New Drop Alert"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all cursor-pointer"
                >
                  <option value="Fashion">Fashion</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Collection">Collection</option>
                  <option value="Trending">Trending</option>
                  <option value="Deal">Deal</option>
                </select>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm({ ...form, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/thumbnail.jpg"
                className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                💡 Custom thumbnail for preview
              </p>
            </div>

            {/* Caption */}
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                Caption / Description
              </label>
              <textarea
                value={form.caption}
                onChange={(e) =>
                  setForm({ ...form, caption: e.target.value })
                }
                rows={3}
                placeholder="Write reel description..."
                className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all resize-none"
              />
            </div>

            {/* Username & Audio Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="@luxe.atelier"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Audio Name
                </label>
                <input
                  type="text"
                  value={form.audioName}
                  onChange={(e) =>
                    setForm({ ...form, audioName: e.target.value })
                  }
                  placeholder="Original audio"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Views Count
                </label>
                <input
                  type="text"
                  value={form.viewsLabel}
                  onChange={(e) =>
                    setForm({ ...form, viewsLabel: e.target.value })
                  }
                  placeholder="120K"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Likes Count
                </label>
                <input
                  type="text"
                  value={form.likesLabel}
                  onChange={(e) =>
                    setForm({ ...form, likesLabel: e.target.value })
                  }
                  placeholder="12.5K"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Comments Count
                </label>
                <input
                  type="text"
                  value={form.commentsLabel}
                  onChange={(e) =>
                    setForm({ ...form, commentsLabel: e.target.value })
                  }
                  placeholder="450"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>
            </div>

            {/* Product Link & Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Link Product (for "Shop This Look")
                </label>
                <select
                  value={form.product}
                  onChange={(e) =>
                    setForm({ ...form, product: e.target.value })
                  }
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all cursor-pointer"
                >
                  <option value="">— No Product —</option>
                  {products.map((product) => (
                    <option
                      key={product._id || product.id}
                      value={product._id || product.id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Display Order (Lower = First)
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: e.target.value })
                  }
                  placeholder="0"
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-pink-50 transition-all"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-black text-gray-700">
                  ✓ Show this reel on homepage
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {editingId ? "🔄 Update Reel" : "➕ Save & Publish"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════ REELS LIST SECTION ═══════════════ */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
          <h3 className="font-black text-lg text-gray-900">
            📊 Published Reels ({reels.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Active reels are displayed on your homepage
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 mt-3 font-medium">Loading reels...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="p-12 text-center">
            <FiInstagram size={56} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-bold text-lg">
              No reels published yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first reel to start showcasing on homepage
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reels
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((reel, idx) => {
                const id = reel._id || reel.id;
                const hasInstagram = !!reel.reelUrl;
                const hasVideo = !!reel.videoUrl;

                return (
                  <div
                    key={id}
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      reel.isActive
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 opacity-70"
                    }`}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-20 h-24 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm border-2 border-gray-100">
                        {reel.thumbnailUrl ? (
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                            <FiInstagram className="text-white" size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h4 className="font-black text-gray-900 text-sm">
                            {reel.title}
                          </h4>
                          <span
                            className={`text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                              reel.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {reel.isActive ? "✓ Live" : "○ Hidden"}
                          </span>
                        </div>

                        {reel.caption && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1.5">
                            {reel.caption}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                            📁 {reel.category || "Fashion"}
                          </span>

                          {hasInstagram && (
                            <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2.5 py-1 rounded-full">
                              📱 Instagram
                            </span>
                          )}

                          {hasVideo && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">
                              🎥 Custom Video
                            </span>
                          )}

                          {reel.product && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">
                              🛍️ Product Linked
                            </span>
                          )}

                          <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-full">
                            #{idx + 1} Position
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 justify-end">
                      {/* Open on Instagram (if Instagram reel) */}
                      {hasInstagram && (
                        <a
                          href={reel.reelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg border-2 border-pink-200 text-pink-600 hover:border-pink-400 hover:text-pink-700 hover:bg-pink-50 transition-all"
                          title="Open on Instagram"
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}

                      {/* Toggle Active/Inactive */}
                      <button
                        onClick={() => handleToggle(id)}
                        className={`p-2.5 rounded-lg border-2 transition-all ${
                          reel.isActive
                            ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            : "border-gray-300 text-gray-500 hover:bg-gray-100"
                        }`}
                        title={reel.isActive ? "Hide from homepage" : "Show on homepage"}
                      >
                        {reel.isActive ? (
                          <FiEye size={16} />
                        ) : (
                          <FiEyeOff size={16} />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditForm(reel)}
                        className="p-2.5 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit reel"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(id)}
                        className="p-2.5 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all"
                        title="Delete from homepage"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ═══════════════ INFO BOX ═══════════════ */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
        <h4 className="font-black text-gray-900 text-sm mb-3">💡 How It Works</h4>
        <ul className="space-y-1.5 text-sm text-gray-700">
          <li>
            ✅ <strong>Instagram Reel:</strong> Paste reel URL for embedded player
          </li>
          <li>
            ✅ <strong>Custom Video:</strong> Upload MP4 for custom video display
          </li>
          <li>
            ✅ <strong>Automatic Display:</strong> Active reels appear on homepage
          </li>
          <li>
            ✅ <strong>Shop Link:</strong> Users can play video → add to cart
          </li>
          <li>
            ✅ <strong>Hide/Show:</strong> Toggle visibility without deleting
          </li>
          <li>
            ✅ <strong>Persistent:</strong> All reels saved in database
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminReelManager;