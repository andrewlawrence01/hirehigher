const DB_NAME = "hirehigher";
const STORE = "files";
const BUILT_KEY = "resumeV2";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    // Runs only the first time (or when the version number goes up)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Run one operation inside a transaction and hand back a promise
async function run(mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = action(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(req.result); };
    t.onerror = t.onabort = () => { db.close(); reject(t.error); };
  });
}

export const getUpload = () => run("readonly", (s) => s.get("current"));
export const removeUpload = () => run("readwrite", (s) => s.delete("current"));
export const saveUpload = (file) =>
  run("readwrite", (s) =>
    s.put({ id: "current", blob: file, name: file.name, size: file.size, updatedAt: Date.now() })
  );

export function getBuilt() {
  try { return JSON.parse(localStorage.getItem(BUILT_KEY)); } catch { return null; }
}
export function saveBuilt(data) {
  try { localStorage.setItem(BUILT_KEY, JSON.stringify({ ...data, updatedAt: Date.now() })); } catch {}
}

export function builtHasContent(b) {
  if (!b) return false;
  const text = ["name", "email", "phone", "location", "link", "summary", "skills"].some((k) => b[k]?.trim());
  const entries = [...(b.jobs || []), ...(b.schools || [])].some((e) => Object.values(e).some((v) => v.trim()));
  return text || entries;
}

export async function getCurrent() {
  const built = getBuilt();
  const b = builtHasContent(built) ? built : null;
  const upload = await getUpload();
  if (b && upload) return (b.updatedAt || 0) > upload.updatedAt ? { kind: "built", data: b } : { kind: "upload", data: upload };
  if (b) return { kind: "built", data: b };
  if (upload) return { kind: "upload", data: upload };
  return null; // nothing yet
}