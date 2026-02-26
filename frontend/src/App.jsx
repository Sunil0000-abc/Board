import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

const TAG_COLORS = {
  Lifestyle: "#e05c2e",
  Tech: "#4a9eda",
  Food: "#5aad6f",
  Books: "#a775d4",
  Travel: "#e8a030",
  Other: "#888",
};

const DARK = {
  bg: "#0f0f13",
  navBg: "rgba(22,22,29,0.92)",
  navBorder: "#2a2a35",
  cardBg: "#1c1c26",
  cardBorder: "#2a2a38",
  inputBg: "#13131a",
  inputBorder: "#2e2e3e",
  modalBg: "#1a1a24",
  modalHeaderBg: "#16161d",
  modalBorder: "#2a2a38",
  overlayBg: "rgba(0,0,0,0.78)",
  text: "#f0eeff",
  textMuted: "#8884a0",
  textFaint: "#44445a",
  subText: "#9490b0",
  tagOpacity: "22",
  addBorder: "#2e2e45",
  addBg: "#161620",
  addBgHover: "#1e1e2e",
  addBorderHover: "#a775d4",
  addLabel: "#44445a",
  addLabelHover: "#a775d4",
  plusBg: "linear-gradient(135deg, #2e2e45, #3a3a55)",
  plusBgHover: "linear-gradient(135deg, #7c4daa, #a775d4)",
  btnGrad: "linear-gradient(135deg, #7c4daa, #a775d4)",
  accent: "#a775d4",
  logo: "#f0eeff",
  scrollThumb: "#3a3a55",
  errorBg: "#e05c2e18",
  errorBorder: "#e05c2e44",
  errorText: "#ff7a5a",
};

const LIGHT = {
  bg: "#f5f1e8",
  navBg: "rgba(250,247,242,0.92)",
  navBorder: "#e4ddd0",
  cardBg: "#ffffff",
  cardBorder: "#ece6da",
  inputBg: "#faf7f2",
  inputBorder: "#e8e2d6",
  modalBg: "#faf7f2",
  modalHeaderBg: "#ffffff",
  modalBorder: "transparent",
  overlayBg: "rgba(26,23,16,0.55)",
  text: "#1a1710",
  textMuted: "#9e9588",
  textFaint: "#ccc6bc",
  subText: "#6b6458",
  tagOpacity: "18",
  addBorder: "#ddd5c4",
  addBg: "#faf7f2",
  addBgHover: "#f0ebe0",
  addBorderHover: "#c47a3a",
  addLabel: "#ccc6bc",
  addLabelHover: "#c47a3a",
  plusBg: "linear-gradient(135deg, #ddd5c4, #ccc4b0)",
  plusBgHover: "linear-gradient(135deg, #c47a3a, #e05c2e)",
  btnGrad: "linear-gradient(135deg, #c47a3a, #e05c2e)",
  accent: "#c47a3a",
  logo: "#1a1710",
  scrollThumb: "#ddd5c4",
  errorBg: "#e05c2e10",
  errorBorder: "#e05c2e33",
  errorText: "#c84b31",
};

/* ─────────────────────────────────────────
   API HELPERS
───────────────────────────────────────── */

// GET /api/userdata — fetch all posts
async function fetchUserData() {
  const res = await fetch(`${BASE_URL}/api/userdata`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// POST /api/create-posts — submit a new post
async function createPostAPI(payload) {
  const res = await fetch(`${BASE_URL}/api/create-userdata`, {
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

/* ─────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────── */

function ThemeToggle({ dark, onToggle }) {
  const t = dark ? DARK : LIGHT;
  return (
    <button
      onClick={onToggle}
      style={{
        background: dark ? "#1e1e2a" : "#f0ebe0",
        border: `1.5px solid ${dark ? "#3a3a55" : "#ddd5c4"}`,
        borderRadius: 50, cursor: "pointer",
        padding: "5px 12px", display: "flex", alignItems: "center",
        gap: 8, transition: "all 0.3s ease",
      }}
    >
      <span style={{ fontSize: "0.9rem" }}>🌙</span>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: t.accent, position: "relative", transition: "background 0.3s" }}>
        <div style={{
          position: "absolute", top: 3, left: dark ? 19 : 3,
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          transition: "left 0.3s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }} />
      </div>
      <span style={{ fontSize: "0.9rem" }}>☀️</span>
    </button>
  );
}

function Avatar({ name, color }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%",
      background: color, color: "#fff", fontWeight: 700,
      fontSize: "1rem", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      fontFamily: "'DM Serif Display', serif",
      boxShadow: `0 4px 12px ${color}44`,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function PostCard({ post, t }) {
  const [hov, setHov] = useState(false);
  const color = post.color || TAG_COLORS[post.tag] || TAG_COLORS.Other;
  const tagColor = TAG_COLORS[post.tag] || TAG_COLORS.Other;

  // Support both API `createdAt` timestamp and static `date` string
  const displayDate = post.date
    ? post.date
    : post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "—";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: t.cardBg, borderRadius: 14, overflow: "hidden",
        border: `1px solid ${hov ? color + "55" : t.cardBorder}`,
        boxShadow: hov ? `0 18px 52px ${color}25` : `0 4px 20px rgba(0,0,0,0.1)`,
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.26s ease", height: "100%",
      }}
    >
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Avatar name={post.name} color={color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "0.92rem", color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {post.name}
            </p>
            <p style={{ fontSize: "0.72rem", color: t.textFaint, marginTop: 2, fontWeight: 300 }}>
              {displayDate}
            </p>
          </div>
          <span style={{
            fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.07em",
            textTransform: "uppercase", padding: "3px 9px", borderRadius: 20,
            background: tagColor + t.tagOpacity, color: tagColor, whiteSpace: "nowrap",
          }}>
            {post.tag}
          </span>
        </div>
        <p style={{ fontSize: "0.9rem", color: t.subText, lineHeight: 1.72, fontWeight: 300 }}>
          {post.text}
        </p>
      </div>
    </div>
  );
}

function AddCard({ onClick, t }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14,
        border: `2px dashed ${hov ? t.addBorderHover : t.addBorder}`,
        background: hov ? t.addBgHover : t.addBg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14, padding: "40px 20px", cursor: "pointer",
        transition: "all 0.26s ease", minHeight: 180,
        boxShadow: hov ? `0 12px 40px ${t.addBorderHover}25` : "none",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      <div style={{
        width: 58, height: 58, borderRadius: "50%",
        background: hov ? t.plusBgHover : t.plusBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s ease",
        transform: hov ? "scale(1.1) rotate(90deg)" : "scale(1) rotate(0deg)",
        boxShadow: hov ? `0 8px 24px ${t.addBorderHover}44` : "none",
      }}>
        <span style={{ fontSize: "1.9rem", color: "#fff", lineHeight: 1 }}>+</span>
      </div>
      <p style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.04em", color: hov ? t.addLabelHover : t.addLabel, transition: "color 0.2s" }}>
        Share something
      </p>
    </div>
  );
}

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

function Modal({ onClose, onAdd, dark, t, submitting }) {
  const [form, setForm] = useState({ name: "", text: "", tag: "Other" });
  const [error, setError] = useState("");

  const base = {
    fontFamily: "'Lato', sans-serif", fontSize: "0.92rem",
    padding: "11px 14px", border: `1.5px solid ${t.inputBorder}`,
    borderRadius: 8, background: t.inputBg, color: t.text,
    outline: "none", transition: "border-color 0.18s", width: "100%",
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.text.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    onAdd(form, setError);
  };

  return (
    <div
      onClick={() => !submitting && onClose()}
      style={{ position: "fixed", inset: 0, background: t.overlayBg, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.modalBg, borderRadius: 18, width: "100%", maxWidth: 480,
          boxShadow: dark ? "0 28px 80px rgba(0,0,0,0.65)" : "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden", border: `1px solid ${t.modalBorder}`,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px 18px", borderBottom: `1px solid ${t.navBorder}`, background: t.modalHeaderBg }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: t.text }}>New Post</h2>
          <button onClick={() => !submitting && onClose()} style={{ background: "none", border: "none", fontSize: "1rem", color: t.textMuted, cursor: submitting ? "not-allowed" : "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: t.textMuted }}>YOUR NAME</label>
            <input
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }}
              placeholder="e.g. Jane Smith"
              style={base}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            />
          </div>

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: t.textMuted }}>WHAT'S ON YOUR MIND?</label>
            <textarea
              value={form.text}
              onChange={(e) => { setForm({ ...form, text: e.target.value }); setError(""); }}
              placeholder="Write anything..."
              rows={4}
              style={{ ...base, resize: "vertical" }}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            />
          </div>

          {/* Tag */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: t.textMuted }}>TAG</label>
            <select
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              style={base}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            >
              {Object.keys(TAG_COLORS).map((tag) => <option key={tag}>{tag}</option>)}
            </select>
          </div>

          {/* Inline error */}
          {error && (
            <p style={{
              color: t.errorText, fontSize: "0.82rem",
              background: t.errorBg, border: `1px solid ${t.errorBorder}`,
              borderRadius: 6, padding: "8px 12px",
            }}>
              ⚠ {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? (dark ? "#2e2e45" : "#ddd5c4") : t.btnGrad,
              color: submitting ? t.textMuted : "#fff",
              border: "none", borderRadius: 9, padding: "13px 28px",
              fontSize: "0.95rem", fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "'Lato', sans-serif", letterSpacing: "0.02em",
              marginTop: 4, transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {submitting ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: `2px solid ${t.textMuted}`, borderTopColor: "transparent",
                  display: "inline-block", animation: "spin 0.7s linear infinite",
                }} />
                Posting...
              </>
            ) : "Post it →"}
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
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const t = dark ? DARK : LIGHT;

  /* ── GET /api/userdata ── */
  const loadPosts = async () => {
    try {
      setLoading(true);
      setApiError("");
      const json = await fetchUserData();
      // Accept both { data: [...] } and plain array
      const items = Array.isArray(json) ? json : (json.data ?? []);
      setPosts(items);
    } catch (err) {
      setApiError(err.message || "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  /* ── POST /api/create-posts ── */
  const handleAdd = async ({ name, text, tag }, setModalError) => {
    try {
      setSubmitting(true);
      const color = TAG_COLORS[tag] || TAG_COLORS.Other;
      const json = await createPostAPI({ name, text, tag, color });
      // Accept both { data: {...} } and plain object
      const newPost = json.data ?? json;
      setPosts((prev) => [newPost, ...prev]);
      setShowModal(false);
    } catch (err) {
      setModalError(err.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
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
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Lato', sans-serif", transition: "background 0.4s ease", paddingBottom: 80 }}>

        {/* NAV */}
        <nav style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 40px", borderBottom: `1px solid ${t.navBorder}`,
          background: t.navBg, position: "sticky", top: 0, zIndex: 100,
          backdropFilter: "blur(12px)", transition: "background 0.4s, border-color 0.4s",
        }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", color: t.logo, letterSpacing: "-0.01em" }}>
            ✦ Board
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {!loading && (
              <span style={{ fontSize: "0.77rem", color: t.textMuted, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 700 }}>
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
          </div>
        </nav>

        {/* HERO */}
        <div style={{ textAlign: "center", padding: "60px 20px 44px" }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", color: t.text, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            What's everyone sharing?
          </h1>
          <p style={{ marginTop: 10, color: t.textMuted, fontSize: "1rem", fontWeight: 300 }}>
            Thoughts, stories, and moments from the community
          </p>
        </div>

        {/* ERROR BANNER */}
        {apiError && (
          <div style={{
            maxWidth: 680, margin: "0 auto 32px", padding: "14px 20px",
            background: t.errorBg, border: `1px solid ${t.errorBorder}`,
            borderRadius: 10, color: t.errorText, fontSize: "0.875rem",
            textAlign: "center", animation: "fadeIn 0.3s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <span>⚠ {apiError}</span>
            <button
              onClick={loadPosts}
              style={{
                background: "none", border: `1px solid ${t.errorBorder}`,
                color: t.errorText, borderRadius: 5, padding: "3px 12px",
                cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Lato', sans-serif",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* GRID */}
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22,
        }}>
          {/* Skeleton placeholders while fetching */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} t={t} />
          ))}

          {/* Posts with staggered fade-in */}
          {!loading && posts.map((post, i) => (
            <div key={post._id ?? post.id ?? i} style={{ animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
              <PostCard post={post} t={t} />
            </div>
          ))}

          {/* Add card — always rendered last */}
          {!loading && (
            <div style={{ animation: `fadeIn 0.4s ease ${posts.length * 0.06}s both` }}>
              <AddCard onClick={() => setShowModal(true)} t={t} />
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          onClose={() => !submitting && setShowModal(false)}
          onAdd={handleAdd}
          dark={dark}
          t={t}
          submitting={submitting}
        />
      )}
    </>
  );
}