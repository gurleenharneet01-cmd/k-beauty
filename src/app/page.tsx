// K-Glow Starter - adapted for Next.js
'use client';

import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { useToast } from '@/hooks/use-toast';


// Minimal inline styles to avoid Tailwind requirement for quick demo
const styles: { [key: string]: CSSProperties } = {
  app: { fontFamily: 'Inter, system-ui, Arial, sans-serif', maxWidth: 980, margin: '24px auto', padding: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 18 },
  card: { border: '1px solid #e6e6e6', borderRadius: 12, padding: 12, marginBottom: '1rem' },
  productList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  productItem: { padding: 10, border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' },
  small: { fontSize: 12, color: '#666' },
  btn: { padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: '#eee' }
};

// Small sample dataset (3 products). Expand as needed.
const SAMPLE_PRODUCTS = [
  {
    id: 'p001', name: 'Hydra Glow Serum', brand: 'SeoulLab', category: 'Serum', priceTier: 'mid',
    images: [], ingredients: 'Butylene Glycol, Niacinamide, Hyaluronic Acid', tags: ['hydrating', 'brightening'], shades: []
  },
  {
    id: 'p002', name: 'Velvet Matte Lip Tint', brand: 'CherryMoon', category: 'Lip', priceTier: 'budget',
    images: [], ingredients: 'Isododecane, Trimethylsiloxysilicate, Red 7 Lake', tags: ['longwear'],
    shades: [{ name: '01 Nude', hex: '#c68b7a' }, { name: '05 Cherry', hex: '#b2313a' }]
  },
  {
    id: 'p003', name: 'Daily Cushion SPF 50', brand: 'KBeautyCo', category: 'Sunscreen/Makeup', priceTier: 'premium',
    images: [], ingredients: 'Titanium Dioxide, Zinc Oxide, Niacinamide', tags: ['spf', 'makeup'],
    shades: [{ name: 'Light', hex: '#f1d0b9' }, { name: 'Medium', hex: '#e3b892' }]
  }
];

// Simple local favorite store using localStorage
function useLocalFavorites(key = 'kg_favs'){
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) {
        setFavs(JSON.parse(s));
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
      setFavs([]);
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(favs));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favs, key]);

  const toggle = (id: string) => setFavs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  return { favs, toggle };
}


// Lipstick try-on prototype component (client-side overlay using simple canvas + webcam)
function LipstickTryOn({ product }: { product: any }){
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeShade, setActiveShade] = useState(product?.shades?.[0] ?? { name: 'Demo', hex: '#b2313a' });
  const [opacity, setOpacity] = useState(0.6);
  const [mirrored, setMirrored] = useState(true);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setActiveShade(product?.shades?.[0] ?? { name: 'Demo', hex: '#b2313a' });
  }, [product]);

  useEffect(() => {
    let stream: MediaStream;
    async function startVideo(){
      try{
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } else {
            throw new Error('getUserMedia not supported');
        }
      }catch(e){ 
        console.error('Camera start failed', e); 
        toast({
            variant: "destructive",
            title: "Camera Error",
            description: "Could not access the camera. Please check permissions and try again.",
          });
          setRunning(false);
      }
    }
    if(running) startVideo();
    return () => { if(stream) { stream.getTracks().forEach(t=>t.stop()); } };
  }, [running, toast]);

  // Very simple fake-lip overlay: we don't run face mesh here to keep demo dependency-free.
  // This draws an approximate oval center-bottom of the face box. For production use: integrate MediaPipe FaceMesh or face-api.js.
  useEffect(() => {
    let raf: number;
    function draw(){
      const v = videoRef.current; const c = canvasRef.current; if(!v || !c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      c.width = v.videoWidth; c.height = v.videoHeight;
      ctx.save();
      if(mirrored){ ctx.translate(c.width, 0); ctx.scale(-1, 1); }
      ctx.clearRect(0,0,c.width,c.height);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      // draw lip overlay approx
      const lx = c.width * 0.45, ly = c.height * 0.62; const lw = c.width * 0.12, lh = c.height * 0.06;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = activeShade.hex; ctx.globalAlpha = opacity;
      ctx.beginPath(); ctx.ellipse(lx, ly, lw, lh, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    }
    if(running && videoRef.current?.HAVE_ENOUGH_DATA) {
        raf = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(raf);
  }, [running, activeShade, opacity, mirrored]);

  if (product?.category !== 'Lip') {
      return (
        <div style={{...styles.card}}>
            <h3>Lipstick Try-On (Prototype)</h3>
            <p style={styles.small}>Select a lipstick product to enable the virtual try-on feature.</p>
        </div>
      );
  }

  return (
    <div style={{...styles.card}}>
      <h3>Lipstick Try-On (Prototype)</h3>
      <div style={{position: 'relative'}}>
        <video ref={videoRef} style={{display: running ? 'block' : 'none', width: '100%', borderRadius: 8}} playsInline muted />
        <canvas ref={canvasRef} style={{width: '100%', borderRadius: 8, background: '#111', display: !running ? 'block' : 'none'}} />
        {running && <canvas ref={canvasRef} style={{width: '100%', borderRadius: 8, position: 'absolute', top: 0, left: 0}} />}

      </div>
      <div style={{marginTop: 10, display: 'flex', gap: 8, alignItems: 'center'}}>
        <button style={styles.btn} onClick={() => setRunning(r => !r)}>{running ? 'Stop' : 'Start Camera'}</button>
        <label style={styles.small}><input type="checkbox" checked={mirrored} onChange={e=>setMirrored(e.target.checked)} /> Mirror</label>
      </div>
      <div style={{marginTop: 10}}>
        <label style={styles.small}>Shade:</label>
        <div style={{display: 'flex', gap: 8, marginTop: 6}}>
          {(product?.shades ?? [activeShade]).map((s:any) => (
            <button key={s.name} onClick={()=>setActiveShade(s)} style={{width: 24, height: 24, borderRadius: 12, border: '1px solid #ddd', background: s.hex, cursor: 'pointer'}} title={s.name} />
          ))}
        </div>
        <div style={{marginTop:8}}>
          <label style={styles.small}>Opacity</label>
          <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e=>setOpacity(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onSelect, isFav, toggleFav }: {p: any, onSelect: (p: any) => void, isFav: boolean, toggleFav: (id: string) => void}){
  return (
    <div style={styles.productItem} onClick={() => onSelect(p)}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <strong>{p.name}</strong>
        <button onClick={(e)=>{ e.stopPropagation(); toggleFav(p.id); }} style={{...styles.btn}}>{isFav ? '♥' : '♡'}</button>
      </div>
      <div style={styles.small}>{p.brand} • {p.category}</div>
      <div style={{marginTop:8}}>
        {p.shades && p.shades.length>0 ? (
          <div style={{display:'flex', gap:6}}>{p.shades.map((s:any) => <div key={s.name} title={s.name} style={{width:18,height:18, borderRadius:6, background:s.hex, border:'1px solid #ccc'}} />)}</div>
        ) : <div style={styles.small}>No shades</div>}
      </div>
    </div>
  );
}

export default function App(){
  const [products] = useState(SAMPLE_PRODUCTS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(products[1]);
  const { favs, toggle } = useLocalFavorites();
  const { toast } = useToast();

  // simple client-side fuzzy search using Fuse.js if installed; fallback to simple includes.
  const [results, setResults] = useState(products);
  useEffect(()=>{
    if(!query) { setResults(products); return; }
    try{
      // dynamic import to avoid hard dependency
      import('fuse.js').then(({ default: Fuse }) => {
        const fuse = new Fuse(products, { keys: ['name', 'brand', 'tags'], threshold: 0.35 });
        const r = fuse.search(query).map(x=>x.item);
        setResults(r);
      }).catch(()=>{
        setResults(products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())));
      });
    }catch(e){ setResults(products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))); }
  }, [query, products]);

  const handleResponsiveLayout = () => {
    if (window.innerWidth < 768) {
      styles.grid = { display: 'grid', gridTemplateColumns: '1fr', gap: 18 };
    } else {
      styles.grid = { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 18 };
    }
  };

  useEffect(() => {
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
    return () => window.removeEventListener('resize', handleResponsiveLayout);
  }, []);

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1>K-Glow — Starter</h1>
        <div>
          <input placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #ddd'}} />
        </div>
      </div>

      <div style={styles.grid}>
        <div>
          <div style={{...styles.card, marginBottom: 12}}>
            <h3>Products</h3>
            <div style={styles.productList}>
              {results.map(p => <ProductCard key={p.id} p={p} onSelect={setSelected} isFav={favs.includes(p.id)} toggleFav={toggle} />)}
            </div>
          </div>

          <div style={styles.card}>
            <h3>Your Favorites</h3>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {favs.length===0 ? <div style={styles.small}>No favorites yet</div> : favs.map(id => { const p = products.find(x=>x.id===id); return p ? <div key={id} style={{padding:6,border:'1px solid #eee',borderRadius:8}}>{p.name}</div> : null })}
            </div>
          </div>
        </div>

        <div>
          <div style={styles.card}>
            <h3>Selected</h3>
            {selected ? (
              <div>
                <strong>{selected.name}</strong>
                <div style={styles.small}>{selected.brand} • {selected.category}</div>
                <p style={{marginTop:8, fontSize: '0.9rem', color: '#333'}}>{selected.ingredients}</p>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button style={styles.btn} onClick={()=>toast({ title: 'Mock Action', description: 'Saved to routine!' })}>Save to routine</button>
                  <button style={styles.btn} onClick={()=>toast({ title: 'Mock Action', description: 'Added review!' })}>Add review</button>
                </div>
              </div>
            ) : <div style={styles.small}>Select a product to see details</div>}
          </div>
          
          {selected && <LipstickTryOn product={selected} />}
        </div>
      </div>

      <footer style={{marginTop:20, textAlign:'center', color:'#777'}}>
        Prototype • All processing local — no backend required for demo
      </footer>
    </div>
  );
}
