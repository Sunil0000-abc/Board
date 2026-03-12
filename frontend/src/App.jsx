import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL = "http://localhost:8000";
const PAGE_SIZE = 6;

const TAG_COLORS = {
  Lifestyle: "#e05c2e",
  Tech:      "#4a9eda",
  Food:      "#5aad6f",
  Books:     "#a775d4",
  Travel:    "#e8a030",
  Other:     "#888",
};

const DARK = {
  bg: "#0f0f13", navBg: "rgba(22,22,29,0.92)", navBorder: "#2a2a35",
  cardBg: "#1c1c26", cardBorder: "#2a2a38", inputBg: "#13131a",
  inputBorder: "#2e2e3e", modalBg: "#1a1a24", modalHeaderBg: "#16161d",
  modalBorder: "#2a2a38", overlayBg: "rgba(0,0,0,0.78)",
  text: "#f0eeff", textMuted: "#8884a0", textFaint: "#44445a",
  subText: "#9490b0", tagOpacity: "22",
  addBorder: "#2e2e45", addBg: "#161620", addBgHover: "#1e1e2e",
  addBorderHover: "#a775d4", addLabel: "#44445a", addLabelHover: "#a775d4",
  plusBg: "linear-gradient(135deg, #2e2e45, #3a3a55)",
  plusBgHover: "linear-gradient(135deg, #7c4daa, #a775d4)",
  btnGrad: "linear-gradient(135deg, #7c4daa, #a775d4)",
  accent: "#a775d4", logo: "#f0eeff", scrollThumb: "#3a3a55",
  errorBg: "#e05c2e18", errorBorder: "#e05c2e44", errorText: "#ff7a5a",
  searchBg: "#16161d", searchBorder: "#2a2a38",
  deleteBg: "#2a1a1a", deleteColor: "#e05c2e", deleteBorder: "#3d1f1f",
};

const LIGHT = {
  bg: "#f5f1e8", navBg: "rgba(250,247,242,0.92)", navBorder: "#e4ddd0",
  cardBg: "#ffffff", cardBorder: "#ece6da", inputBg: "#faf7f2",
  inputBorder: "#e8e2d6", modalBg: "#faf7f2", modalHeaderBg: "#ffffff",
  modalBorder: "transparent", overlayBg: "rgba(26,23,16,0.55)",
  text: "#1a1710", textMuted: "#9e9588", textFaint: "#ccc6bc",
  subText: "#6b6458", tagOpacity: "18",
  addBorder: "#ddd5c4", addBg: "#faf7f2", addBgHover: "#f0ebe0",
  addBorderHover: "#c47a3a", addLabel: "#ccc6bc", addLabelHover: "#c47a3a",
  plusBg: "linear-gradient(135deg, #ddd5c4, #ccc4b0)",
  plusBgHover: "linear-gradient(135deg, #c47a3a, #e05c2e)",
  btnGrad: "linear-gradient(135deg, #c47a3a, #e05c2e)",
  accent: "#c47a3a", logo: "#1a1710", scrollThumb: "#ddd5c4",
  errorBg: "#e05c2e10", errorBorder: "#e05c2e33", errorText: "#c84b31",
  searchBg: "#ffffff", searchBorder: "#e8e2d6",
  deleteBg: "#fff5f3", deleteColor: "#e05c2e", deleteBorder: "#fad4cc",
};

/* ─────────────────────────────────────────
   API HELPERS
───────────────────────────────────────── */
async function fetchUserData() {
  const res = await fetch(`${BASE_URL}/api/userdata`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

async function createPostAPI(payload) {
  const res = await fetch(`${BASE_URL}/api/create-posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error: ${res.status}`);
  }
  return res.json();
}

async function deletePostAPI(id) {
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
}

/* ─────────────────────────────────────────
   HIGHLIGHT SEARCH MATCHES
───────────────────────────────────────── */
function Highlight({ text, query, color }) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: color + "44", color: "inherit", borderRadius: 3, padding: "0 1px" }}>{part}</mark>
          : part
      )}
    </span>
  );
}

/* ─────────────────────────────────────────
   SEARCH BAR
───────────────────────────────────────── */
function SearchBar({ query, onChange, t, resultCount, totalCount }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ maxWidth: 560, margin: "0 auto 36px", padding: "0 24px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: t.searchBg, border: `1.5px solid ${focused ? t.accent : t.searchBorder}`,
        borderRadius: 12, padding: "10px 16px",
        boxShadow: focused ? `0 0 0 3px ${t.accent}22` : "0 2px 12px rgba(0,0,0,0.07)",
        transition: "all 0.22s ease",
      }}>
        <span style={{ fontSize: "1rem", opacity: 0.45, flexShrink: 0 }}>🔍</span>
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by name, text, or tag…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'Lato', sans-serif", fontSize: "0.93rem", color: t.text }}
        />
        {query && (
          <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "0.9rem", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>✕</button>
        )}
      </div>
      {query && (
        <p style={{ textAlign: "center", marginTop: 8, fontSize: "0.78rem", color: t.textMuted }}>
          {resultCount === 0
            ? "No posts match your search"
            : `${resultCount} of ${totalCount} post${totalCount !== 1 ? "s" : ""} match`}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────── */
function ThemeToggle({ dark, onToggle }) {
  const t = dark ? DARK : LIGHT;
  return (
    <button onClick={onToggle} style={{ background: dark ? "#1e1e2a" : "#f0ebe0", border: `1.5px solid ${dark ? "#3a3a55" : "#ddd5c4"}`, borderRadius: 50, cursor: "pointer", padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s ease" }}>
      <span style={{ fontSize: "0.9rem" }}>🌙</span>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: t.accent, position: "relative", transition: "background 0.3s" }}>
        <div style={{ position: "absolute", top: 3, left: dark ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.3s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
      </div>
      <span style={{ fontSize: "0.9rem" }}>☀️</span>
    </button>
  );
}

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */
function Avatar({ name, color }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", background: color, color: "#fff", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'DM Serif Display', serif", boxShadow: `0 4px 12px ${color}44` }}>
      {name[0].toUpperCase()}
    </div>
  );
}

/* ─────────────────────────────────────────
   POST CARD (with delete)
───────────────────────────────────────── */
function PostCard({ post, t, onDelete, searchQuery, deleting }) {
  const [hov, setHov] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef(null);

  const color = post.color || TAG_COLORS[post.tag] || TAG_COLORS.Other;
  const tagColor = TAG_COLORS[post.tag] || TAG_COLORS.Other;

  const displayDate = post.date
    ? post.date
    : post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (deleting) return;
    if (confirmDelete) {
      clearTimeout(timerRef.current);
      onDelete(post._id ?? post.id);
    } else {
      setConfirmDelete(true);
      timerRef.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); }}
      style={{
        background: t.cardBg, borderRadius: 14, overflow: "hidden",
        border: `1px solid ${hov ? color + "55" : t.cardBorder}`,
        boxShadow: hov ? `0 18px 52px ${color}25` : `0 4px 20px rgba(0,0,0,0.1)`,
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.26s ease", height: "100%",
        opacity: deleting ? 0.45 : 1,
      }}
    >
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: "18px 20px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <Avatar name={post.name} color={color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "0.92rem", color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <Highlight text={post.name} query={searchQuery} color={color} />
            </p>
            <p style={{ fontSize: "0.72rem", color: t.textFaint, marginTop: 2, fontWeight: 300 }}>{displayDate}</p>
          </div>

          {/* Tag */}
          <span style={{ fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, background: tagColor + t.tagOpacity, color: tagColor, whiteSpace: "nowrap", flexShrink: 0 }}>
            <Highlight text={post.tag} query={searchQuery} color={tagColor} />
          </span>

          {/* Delete button — two-stage: click once → "Sure?", click again → delete */}
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            title={confirmDelete ? "Click to confirm deletion" : "Delete this post"}
            style={{
              background: confirmDelete ? t.deleteBg : "transparent",
              border: confirmDelete ? `1px solid ${t.deleteBorder}` : "1px solid transparent",
              borderRadius: 6, padding: confirmDelete ? "3px 8px" : "3px 5px",
              cursor: deleting ? "not-allowed" : "pointer",
              color: confirmDelete ? t.deleteColor : t.textFaint,
              fontSize: confirmDelete ? "0.68rem" : "0.82rem",
              fontWeight: confirmDelete ? 700 : 400,
              fontFamily: "'Lato', sans-serif",
              flexShrink: 0, transition: "all 0.18s",
              whiteSpace: "nowrap", lineHeight: 1.4,
            }}
            onMouseEnter={(e) => { if (!confirmDelete) e.currentTarget.style.color = t.deleteColor; }}
            onMouseLeave={(e) => { if (!confirmDelete) e.currentTarget.style.color = t.textFaint; }}
          >
            {deleting ? "…" : confirmDelete ? "Sure?" : "✕"}
          </button>
        </div>

        {/* Text */}
        <p style={{ fontSize: "0.9rem", color: t.subText, lineHeight: 1.72, fontWeight: 300 }}>
          <Highlight text={post.text} query={searchQuery} color={color} />
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ADD CARD
───────────────────────────────────────── */
function AddCard({ onClick, t }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 14, border: `2px dashed ${hov ? t.addBorderHover : t.addBorder}`, background: hov ? t.addBgHover : t.addBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "40px 20px", cursor: "pointer", transition: "all 0.26s ease", minHeight: 180, boxShadow: hov ? `0 12px 40px ${t.addBorderHover}25` : "none", transform: hov ? "translateY(-6px)" : "translateY(0)" }}>
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: hov ? t.plusBgHover : t.plusBg, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", transform: hov ? "scale(1.1) rotate(90deg)" : "scale(1) rotate(0deg)", boxShadow: hov ? `0 8px 24px ${t.addBorderHover}44` : "none" }}>
        <span style={{ fontSize: "1.9rem", color: "#fff", lineHeight: 1 }}>+</span>
      </div>
      <p style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.04em", color: hov ? t.addLabelHover : t.addLabel, transition: "color 0.2s" }}>Share something</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────── */
function SkeletonCard({ t }) {
  return (
    <div style={{ background: t.cardBg, borderRadius: 14, overflow: "hidden", border: `1px solid ${t.cardBorder}` }}>
      <div style={{ height: 4, background: t.cardBorder }} />
      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.cardBorder, flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 11, borderRadius: 6, background: t.cardBorder, width: "50%", marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 9, borderRadius: 6, background: t.cardBorder, width: "30%", animation: "pulse 1.5s ease-in-out infinite 0.2s" }} />
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 6, background: t.cardBorder, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite 0.1s" }} />
        <div style={{ height: 10, borderRadius: 6, background: t.cardBorder, marginBottom: 8, width: "80%", animation: "pulse 1.5s ease-in-out infinite 0.2s" }} />
        <div style={{ height: 10, borderRadius: 6, background: t.cardBorder, width: "60%", animation: "pulse 1.5s ease-in-out infinite 0.3s" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INFINITE SCROLL SENTINEL
───────────────────────────────────────── */
function ScrollSentinel({ onVisible, t, hasMore }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) onVisible(); },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, hasMore]);

  return (
    <div ref={ref} style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0", minHeight: 40 }}>
      {hasMore && (
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MODAL
───────────────────────────────────────── */
function Modal({ onClose, onAdd, dark, t, submitting }) {
  const [form, setForm] = useState({ name: "", text: "", tag: "Other" });
  const [error, setError] = useState("");

  const base = { fontFamily: "'Lato', sans-serif", fontSize: "0.92rem", padding: "11px 14px", border: `1.5px solid ${t.inputBorder}`, borderRadius: 8, background: t.inputBg, color: t.text, outline: "none", transition: "border-color 0.18s", width: "100%" };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.text.trim()) { setError("Please fill in both fields."); return; }
    onAdd(form, setError);
  };

  return (
    <div onClick={() => !submitting && onClose()} style={{ position: "fixed", inset: 0, background: t.overlayBg, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.modalBg, borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: dark ? "0 28px 80px rgba(0,0,0,0.65)" : "0 24px 80px rgba(0,0,0,0.18)", overflow: "hidden", border: `1px solid ${t.modalBorder}`, animation: "slideUp 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px 18px", borderBottom: `1px solid ${t.navBorder}`, background: t.modalHeaderBg }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: t.text }}>New Post</h2>
          <button onClick={() => !submitting && onClose()} style={{ background: "none", border: "none", fontSize: "1rem", color: t.textMuted, cursor: submitting ? "not-allowed" : "pointer", padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "YOUR NAME", key: "name", type: "input", placeholder: "e.g. Jane Smith" },
            { label: "WHAT'S ON YOUR MIND?", key: "text", type: "textarea", placeholder: "Write anything..." },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: t.textMuted }}>{label}</label>
              {type === "textarea"
                ? <textarea value={form[key]} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setError(""); }} placeholder={placeholder} rows={4} style={{ ...base, resize: "vertical" }} onFocus={(e) => (e.target.style.borderColor = t.accent)} onBlur={(e) => (e.target.style.borderColor = t.inputBorder)} />
                : <input value={form[key]} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setError(""); }} placeholder={placeholder} style={base} onFocus={(e) => (e.target.style.borderColor = t.accent)} onBlur={(e) => (e.target.style.borderColor = t.inputBorder)} />}
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: t.textMuted }}>TAG</label>
            <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} style={base} onFocus={(e) => (e.target.style.borderColor = t.accent)} onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}>
              {Object.keys(TAG_COLORS).map((tag) => <option key={tag}>{tag}</option>)}
            </select>
          </div>
          {error && <p style={{ color: t.errorText, fontSize: "0.82rem", background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 6, padding: "8px 12px" }}>⚠ {error}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background: submitting ? (dark ? "#2e2e45" : "#ddd5c4") : t.btnGrad, color: submitting ? t.textMuted : "#fff", border: "none", borderRadius: 9, padding: "13px 28px", fontSize: "0.95rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Lato', sans-serif", letterSpacing: "0.02em", marginTop: 4, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {submitting
              ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${t.textMuted}`, borderTopColor: "transparent", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Posting...</>
              : "Post it →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function PostGrid() {
  const [dark, setDark] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [apiError, setApiError] = useState("");
  const t = dark ? DARK : LIGHT;

  // Filtered posts based on search query
  const filteredPosts = allPosts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.text.toLowerCase().includes(q) ||
      (p.tag || "").toLowerCase().includes(q)
    );
  });

  // Slice for infinite scroll
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // Reset visible slice on search change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery]);

  /* GET /api/userdata */
  const loadPosts = async () => {
    try {
      setLoading(true);
      setApiError("");
      const json = await fetchUserData();
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setAllPosts(items);
    } catch (err) {
      setApiError(err.message || "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  /* Load next batch when sentinel is visible */
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredPosts.length));
  }, [filteredPosts.length]);

  /* POST /api/create-posts */
  const handleAdd = async ({ name, text, tag }, setModalError) => {
    try {
      setSubmitting(true);
      const color = TAG_COLORS[tag] || TAG_COLORS.Other;
      const json = await createPostAPI({ name, text, tag, color });
      const newPost = json.data ?? json;
      setAllPosts((prev) => [newPost, ...prev]);
      setVisibleCount((prev) => prev + 1);
      setShowModal(false);
    } catch (err) {
      setModalError(err.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  /* DELETE /api/posts/:id */
  const handleDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deletePostAPI(id);
      setAllPosts((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    } catch {
      // silently restore if delete fails
    } finally {
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp{ from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Lato', sans-serif", transition: "background 0.4s ease", paddingBottom: 100 }}>

        {/* NAV */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", borderBottom: `1px solid ${t.navBorder}`, background: t.navBg, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)", transition: "background 0.4s, border-color 0.4s" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", color: t.logo, letterSpacing: "-0.01em" }}>✦ Board</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {!loading && (
              <span style={{ fontSize: "0.77rem", color: t.textMuted, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 700 }}>
                {searchQuery
                  ? `${filteredPosts.length} / ${allPosts.length} posts`
                  : `${allPosts.length} ${allPosts.length === 1 ? "post" : "posts"}`}
              </span>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
          </div>
        </nav>

        {/* HERO */}
        <div style={{ textAlign: "center", padding: "60px 20px 36px" }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", color: t.text, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            What's everyone sharing?
          </h1>
          <p style={{ marginTop: 10, color: t.textMuted, fontSize: "1rem", fontWeight: 300 }}>
            Thoughts, stories, and moments from the community
          </p>
        </div>

        {/* SEARCH BAR */}
        {!loading && (
          <SearchBar query={searchQuery} onChange={setSearchQuery} t={t} resultCount={filteredPosts.length} totalCount={allPosts.length} />
        )}

        {/* ERROR BANNER */}
        {apiError && (
          <div style={{ maxWidth: 680, margin: "0 auto 32px", padding: "14px 20px", background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 10, color: t.errorText, fontSize: "0.875rem", textAlign: "center", animation: "fadeIn 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span>⚠ {apiError}</span>
            <button onClick={loadPosts} style={{ background: "none", border: `1px solid ${t.errorBorder}`, color: t.errorText, borderRadius: 5, padding: "3px 12px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Lato', sans-serif" }}>Retry</button>
          </div>
        )}

        {/* GRID */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>

          {/* Skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} t={t} />)}

          {/* Empty search state */}
          {!loading && filteredPosts.length === 0 && searchQuery && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: t.textMuted }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: "1.05rem", fontWeight: 600, color: t.text }}>No results for "{searchQuery}"</p>
              <p style={{ fontSize: "0.88rem", marginTop: 6, fontWeight: 300 }}>Try a different name, tag, or keyword</p>
              <button onClick={() => setSearchQuery("")} style={{ marginTop: 18, background: t.btnGrad, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>
                Clear search
              </button>
            </div>
          )}

          {/* Visible posts */}
          {!loading && visiblePosts.map((post, i) => {
            const id = post._id ?? post.id ?? i;
            return (
              <div key={id} style={{ animation: `fadeIn 0.4s ease ${(i % PAGE_SIZE) * 0.06}s both` }}>
                <PostCard post={post} t={t} onDelete={handleDelete} searchQuery={searchQuery} deleting={deletingIds.has(id)} />
              </div>
            );
          })}

          {/* Infinite scroll sentinel */}
          {!loading && filteredPosts.length > 0 && (
            <ScrollSentinel onVisible={loadMore} t={t} hasMore={hasMore} />
          )}

          {/* Add card */}
          {!loading && (
            <div style={{ animation: "fadeIn 0.4s ease both" }}>
              <AddCard onClick={() => setShowModal(true)} t={t} />
            </div>
          )}
        </div>

        {/* All loaded indicator */}
        {!loading && !hasMore && filteredPosts.length > PAGE_SIZE && !searchQuery && (
          <p style={{ textAlign: "center", marginTop: 32, fontSize: "0.78rem", color: t.textFaint, letterSpacing: "0.07em" }}>
            ✦ All {allPosts.length} posts loaded
          </p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal onClose={() => !submitting && setShowModal(false)} onAdd={handleAdd} dark={dark} t={t} submitting={submitting} />
      )}
    </>
  );
}