
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/firebase'; // Use the provider hook
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Fuse from 'fuse.js';


// ------------------
// Utilities
// ------------------
const uid = () => uuidv4().split('-')[0];

function logEvent(db: Firestore | null, name: string, payload = {}) {
  console.log(`[event] ${name}`, payload);
  if (!db) return;
  // Optionally write to Firestore for analytics
  try {
    const col = collection(db, 'analytics');
    addDoc(col, { name, payload: JSON.stringify(payload), ts: serverTimestamp() });
  } catch (e) {
    // ignore in dev
  }
}

// ------------------
// Mock data (used if Firestore empty)
// ------------------
const SAMPLE_PRODUCTS = [
  {
    id: 'p1',
    title: 'Glass Skin Serum',
    brand: 'SeoulGlow',
    price: 28,
    tags: ['serum', 'hydration', 'glowy'],
    description: 'Brightening serum for dewy glass-skin finish.',
    imageUrl: 'https://picsum.photos/seed/p1/200/200',
  },
  {
    id: 'p2',
    title: 'Centella Rescue Cream',
    brand: 'JejuCalm',
    price: 18,
    tags: ['cream', 'sensitive'],
    description: 'Repairing cream with centella asiatica extract.',
    imageUrl: 'https://picsum.photos/seed/p2/200/200',
  },
  {
    id: 'p3',
    title: 'SPF 50+ Moist Sunscreen',
    brand: 'SunBarrier',
    price: 22,
    tags: ['sunscreen', 'spf', 'daily'],
    description: 'Non-greasy daily sunscreen to protect your glow.',
    imageUrl: 'https://picsum.photos/seed/p3/200/200',
  },
];

// ------------------
// Simple skin analysis engine (rule-based)
// ------------------
function analyzeSkinFromQuiz(answers: Record<string, number>) {
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const types: string[] = [];
  if (answers.oiliness >= 3 && answers.acne >= 2) types.push('Acne-Prone');
  if (answers.dryness >= 3) types.push('Dry');
  if (answers.sensitivity >= 3) types.push('Sensitive');
  if (answers.pigmentation >= 2) types.push('Pigmented');
  if (types.length === 0) types.push('Normal/Combination');
  const recommended: string[] = [];
  if (types.includes('Acne-Prone')) recommended.push('light gel cleanser', 'oil-control serum');
  if (types.includes('Dry')) recommended.push('hydrating serum', 'rich cream');
  if (types.includes('Sensitive')) recommended.push('centella-based products', 'fragrance-free');
  if (types.includes('Pigmented')) recommended.push('vitamin C', 'niacinamide');
  if (types.includes('Normal/Combination')) recommended.push('maintenance sunscreen', 'light serum');
  return { types, score, recommended };
}


export default function KBeautyApp() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const db = firestore;
  const storage = db ? getStorage() : null;

  const [page, setPage] = useState('home');
  const [products, setProducts] = useState<any[]>([]);
  const [queryTxt, setQueryTxt] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [skinReport, setSkinReport] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => {
    if (products.length > 0) {
      return new Fuse(products, { keys: ['name', 'brand', 'tags'], threshold: 0.35 });
    }
    return null;
  }, [products]);

  async function fetchProducts() {
    if (!db) return;
    try {
      const snap = await getDocs(collection(db, 'products'));
      const arr = snap.docs.map(d => d.data());
      setProducts(arr);
      localStorage.setItem('kb_products', JSON.stringify(arr));
    } catch (e) {
      const cached = localStorage.getItem('kb_products');
      if (cached) setProducts(JSON.parse(cached));
    }
  }

  async function seedProductsIfEmpty() {
    if (!db) return;
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) return;
      for (const p of SAMPLE_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), { ...p, createdAt: serverTimestamp() });
      }
      console.log('Seeded sample products');
      fetchProducts();
    } catch (e) {
      console.error('Seed error', e);
    }
  }

  useEffect(() => {
    if (!db) return;
    seedProductsIfEmpty();
    fetchProducts();
  }, [db]);


  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid))
        .then(ud => {
          if (ud.exists()) setFavorites(ud.data().favorites || []);
        })
        .catch(console.error);
    } else {
      setFavorites([]);
    }
  }, [user, db]);


  async function handleGoogleSignIn() {
    if (!auth || !db) return;
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const udoc = await getDoc(doc(db, 'users', res.user.uid));
      if (!udoc.exists()) {
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          favorites: [],
          createdAt: serverTimestamp(),
        });
      }
      logEvent(db, 'google_signin', { uid: res.user.uid });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Google sign in error', description: e.message });
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
    logEvent(db, 'signout', {});
  }

  async function toggleFavorite(pid: string) {
    if (!user || !db) return toast({ title: 'Please sign in to save favorites' });
    const uref = doc(db, 'users', user.uid);
    const newFavs = favorites.includes(pid) ? favorites.filter(x => x !== pid) : [...favorites, pid];
    setFavorites(newFavs);
    try {
      await updateDoc(uref, { favorites: newFavs });
    } catch (e) {
      await setDoc(uref, { uid: user.uid, favorites: newFavs }, { merge: true });
    }
    logEvent(db, 'fav_toggle', { uid: user.uid, pid });
  }

  async function uploadSelfie(file: File) {
    if (!file || !storage) return;
    const id = uid();
    const storageRef = sref(storage, `selfies/${id}-${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setSelfieUrl(url);
      setSkinReport({ message: 'Selfie uploaded. Use the Skin Quiz for deeper analysis.' });
      logEvent(db, 'selfie_upload', { uid: user?.uid || 'anon' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: e.message });
    }
  }

  function handleSelfieInput(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => setSelfieUrl(e.target?.result as string);
    reader.readAsDataURL(f);
    uploadSelfie(f);
  }

  async function adminCreateProduct(p: any) {
    if (!db) return;
    const idp = p.id || uid();
    const pd = { ...p, id: idp, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'products', idp), pd);
    fetchProducts();
    logEvent(db, 'admin_create_product', { uid: user?.uid, pid: idp });
  }

  async function adminDeleteProduct(pid: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'products', pid));
    fetchProducts();
  }

  const [quiz, setQuiz] = useState({ oiliness: 2, sensitivity: 1, acne: 1, dryness: 1, pigmentation: 0 });
  function runQuizAndAnalyze() {
    const report = analyzeSkinFromQuiz(quiz);
    setSkinReport(report);
    logEvent(db, 'skin_quiz', { uid: user?.uid, report });
  }

  const [recs, setRecs] = useState<any[]>([]);
  async function recommendProductsForUser(userId: string) {
    if (!db) return [];
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.exists() ? userDoc.data() : {};
      const favs = data.favorites || [];
      if (favs.length === 0) {
        const q = query(collection(db, 'products'), orderBy('price'));
        const snap = await getDocs(q);
        return snap.docs.slice(0, 3).map(d => d.data());
      }
      const favTags = new Set<string>();
      for (const pid of favs) {
        const pdoc = await getDoc(doc(db, 'products', pid));
        if (pdoc.exists()) (pdoc.data().tags || []).forEach((t: string) => favTags.add(t));
      }
      const results: { score: number, product: any }[] = [];
      const all = await getDocs(collection(db, 'products'));
      for (const d of all.docs) {
        const pd = d.data();
        if (favs.includes(pd.id)) continue;
        const score = (pd.tags || []).filter((t: string) => favTags.has(t)).length;
        if (score > 0) results.push({ score, product: pd });
      }
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 6).map(r => r.product);
    } catch (e) {
      console.error('recommend error', e);
      return [];
    }
  }


  async function loadRecommendations() {
    if (!user) return;
    const r = await recommendProductsForUser(user.uid);
    setRecs(r);
  }

  useEffect(() => {
    if (user) loadRecommendations();
  }, [user]);
  
  const visibleProducts = useMemo(() => {
    let results = products;
    if (queryTxt && fuse) {
      results = fuse.search(queryTxt).map(x => x.item);
    } else if (queryTxt) {
      const q = queryTxt.toLowerCase();
      results = products.filter(p => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
  
    if (filterTag && filterTag !== 'all') {
      results = results.filter(p => (p.tags || []).includes(filterTag));
    }
    
    return results;
  }, [queryTxt, filterTag, products, fuse]);

  const [routine, setRoutine] = useState<{ id: string, step: string }[]>([]);
  function addToRoutine(step: string) {
    setRoutine(r => [...r, { id: uid(), step }]);
    logEvent(db, 'routine_add', { step });
  }
  function removeRoutine(id: string) {
    setRoutine(r => r.filter(x => x.id !== id));
  }

  const isAdmin = user?.email?.endsWith('@glam-lens.com') || false;

  const NavButton = ({ targetPage, children }: { targetPage: string, children: React.ReactNode }) => (
    <Button variant={page === targetPage ? "secondary" : "ghost"} onClick={() => setPage(targetPage)}>{children}</Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 text-gray-800">
      <header className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold font-headline">K-Beauty Lab</h1>
        <nav className="flex gap-2 items-center">
          <NavButton targetPage='home'>Home</NavButton>
          <NavButton targetPage='catalog'>Catalog</NavButton>
          <NavButton targetPage='skin'>Skin Quiz</NavButton>
          <NavButton targetPage='routine'>Routine</NavButton>
          {isUserLoading ? <div>Loading...</div> : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Hi, {user.displayName || user.email}</span>
              <Button variant="destructive" onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
             <Button variant="outline" onClick={handleGoogleSignIn}>Sign in with Google</Button>
          )}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          {page === 'home' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Welcome to K-Beauty Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Try our skin quiz, explore products, build your routine, or upload a selfie for a preview.</p>

                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <Input value={queryTxt} onChange={e => setQueryTxt(e.target.value)} placeholder="Search products or brands" className="w-full" />
                  </div>
                  <div>
                    <Select value={filterTag} onValueChange={setFilterTag}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
                        <SelectItem value="serum">serum</SelectItem>
                        <SelectItem value="cream">cream</SelectItem>
                        <SelectItem value="sunscreen">sunscreen</SelectItem>
                        <SelectItem value="sensitive">sensitive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle className="font-semibold text-lg">Quick Skin Quiz</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm">Get a fast read and recommendations.</p>
                      <div className="mt-3">
                        <MiniQuiz quiz={quiz} setQuiz={setQuiz} onRun={runQuizAndAnalyze} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="font-semibold text-lg">Try-On (Selfie)</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm">Upload a selfie and preview product swatches (AR placeholder).</p>
                      <Input type="file" accept="image/*" onChange={handleSelfieInput} ref={fileRef} className="mt-2" />
                      {selfieUrl && (
                        <div className="mt-3 relative w-64 h-64 border rounded overflow-hidden">
                          <img src={selfieUrl} alt="selfie" className="object-cover w-full h-full" />
                          <div style={{ mixBlendMode: 'overlay', backgroundColor: '#EAB3A7' }} className="absolute left-1/4 top-1/2 w-1/2 h-8 rounded-full opacity-50 border"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {skinReport && (
                  <div className="mt-6 bg-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold">Skin Report</h4>
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(skinReport, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'catalog' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Catalog</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleProducts.map(p => (
                  <Card key={p.id} className="flex gap-4 p-4">
                    <img src={p.imageUrl} alt={p.title} className="w-28 h-28 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-sm text-gray-500">{p.brand} • ${p.price}</p>
                      <p className="text-sm mt-2">{p.description}</p>
                      <div className="mt-2 flex gap-2 items-center">
                        <Button onClick={() => toggleFavorite(p.id)}>{favorites.includes(p.id) ? 'Saved' : 'Save'}</Button>
                        <Button variant="ghost" onClick={() => addToRoutine(p.title)}>Add to routine</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {page === 'skin' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Skin Quiz & Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <MiniQuiz quiz={quiz} setQuiz={setQuiz} onRun={runQuizAndAnalyze} />
                {skinReport && (
                  <div className="mt-4 bg-pink-50 p-4 rounded">
                    <h3 className="font-semibold">Results</h3>
                    <p>Types: {skinReport.types.join(', ')}</p>
                    <p>Recommendations: {skinReport.recommended.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {page === 'routine' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Routine Builder</CardTitle>
                <p className="text-sm">Drag & drop is simulated — add steps below.</p>
              </CardHeader>
              <CardContent>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => addToRoutine('Cleanse')}>Add Cleanse</Button>
                  <Button onClick={() => addToRoutine('Tone')}>Add Tone</Button>
                  <Button onClick={() => addToRoutine('Serum')}>Add Serum</Button>
                  <Button onClick={() => addToRoutine('Moisturize')}>Add Moisturize</Button>
                </div>
                <ul className="mt-4 space-y-2">
                  {routine.map(r => (
                    <li key={r.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{r.step}</span>
                      <Button variant="ghost" onClick={() => removeRoutine(r.id)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold">Your Favorites</h3>
            <ul className="mt-2 space-y-2">
              {favorites.length === 0 && <li className="text-sm text-gray-500">No favorites saved.</li>}
              {favorites.map(fid => {
                const p = products.find(x => x.id === fid);
                if (!p) return null;
                return (
                  <li key={fid} className="flex items-center gap-2">
                    <img src={p.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.brand}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleFavorite(p.id)}>Remove</Button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="mt-2 space-y-2">
              {recs.length === 0 && <li className="text-sm text-gray-500">Sign in to see personalized picks.</li>}
              {recs.map(r => (
                <li key={r.id} className="flex items-center gap-2">
                  <img src={r.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="text-sm">{r.title}</div>
                </li>
              ))}
            </ul>
          </Card>

          {isAdmin && (
            <Card className="p-4">
              <h3 className="font-semibold">Admin</h3>
              <AdminPanel onCreate={adminCreateProduct} onDelete={adminDeleteProduct} products={products} />
            </Card>
          )}

        </aside>
      </main>

      <footer className="max-w-6xl mx-auto p-4 text-center text-xs text-gray-500">Built with ❤️ — K-Beauty Lab prototype</footer>
    </div>
  );
}

// ------------------
// Subcomponents
// ------------------

function MiniQuiz({ quiz, setQuiz, onRun }: { quiz: any, setQuiz: (q: any) => void, onRun: () => void }) {
  return (
    <div className="space-y-3">
      {['oiliness', 'sensitivity', 'acne', 'dryness', 'pigmentation'].map(k => (
        <div key={k}>
          <label className="block text-sm font-medium capitalize">{k}</label>
          <input type="range" min="0" max="4" value={quiz[k]} onChange={e => setQuiz({ ...quiz, [k]: Number(e.target.value) })} className="w-full" />
        </div>
      ))}
      <div className="flex gap-2">
        <Button onClick={onRun}>Run Analysis</Button>
        <Button variant="ghost" onClick={() => setQuiz({ oiliness: 2, sensitivity: 1, acne: 1, dryness: 1, pigmentation: 0 })}>Reset</Button>
      </div>
    </div>
  );
}

function AdminPanel({ onCreate, onDelete, products }: { onCreate: (p: any) => void, onDelete: (pid: string) => void, products: any[] }) {
  const [form, setForm] = useState({ title: '', brand: '', price: 0, tags: '', description: '', imageUrl: '' });
  async function submit() {
    const p = { ...form, tags: form.tags.split(',').map(t => t.trim()), price: Number(form.price) };
    await onCreate(p);
    setForm({ title: '', brand: '', price: 0, tags: '', description: '', imageUrl: '' });
  }
  return (
    <div>
      <div className="space-y-2">
        <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <Input placeholder="Tags (comma)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <Input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <Button onClick={submit}>Create</Button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Existing Products</h4>
        <ul className="space-y-2 mt-2">
          {products.map(p => (
            <li key={p.id} className="flex items-center justify-between border p-2 rounded">
              <div>{p.title} ({p.brand})</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onDelete(p.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

    