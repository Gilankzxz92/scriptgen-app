'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection,
    addDoc,
    query,
    getDocs,
    Timestamp
} from 'firebase/firestore';

// --- Definisi Tipe untuk TypeScript ---
interface ScriptHistory {
  id: string;
  productName: string;
  videoStyle: string;
  generatedScript: string;
  generatedHashtags?: string;
  createdAt: Timestamp;
}

// --- Konfigurasi Firebase ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Inisialisasi Firebase ---
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// --- Komponen Ikon (SVG) ---
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock-fill inline-block mr-2" viewBox="0 0 16 16">
    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
  </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm11 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V4a1 1 0 011-1zM5.293 8.293a1 1 0 011.414 0L8 9.586l1.293-1.293a1 1 0 111.414 1.414L9.414 11l1.293 1.293a1 1 0 01-1.414 1.414L8 12.414l-1.293 1.293a1 1 0 01-1.414-1.414L6.586 11 5.293 9.707a1 1 0 010-1.414zM15 8a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V6a1 1 0 112 0v1h1a1 1 0 011 1z" clipRule="evenodd" />
    </svg>
);

// --- Komponen Halaman ---
const HomePage = ({ setPage }) => (
    <div className="text-center">
        <header className="py-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">Ubah Produk Jadi <span className="text-indigo-600">Cuan</span></h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Buat skrip video viral untuk TikTok, Reels, & Shorts dalam hitungan detik dengan kekuatan AI.</p>
            <button onClick={() => setPage('generator')} className="mt-8 px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">Coba Gratis Sekarang!</button>
        </header>
        <section id="features" className="py-16 bg-gray-50"><h2 className="text-3xl font-bold text-gray-800 mb-12">Fitur Unggulan Kami</h2><div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4"><div className="p-6 bg-white rounded-lg shadow-md"><h3 className="font-bold text-xl mb-2">Generator Cerdas</h3><p className="text-gray-600">AI kami merancang skrip yang terstruktur dari hook hingga call to action.</p></div><div className="p-6 bg-white rounded-lg shadow-md"><h3 className="font-bold text-xl mb-2">Beragam Gaya & Platform</h3><p className="text-gray-600">Pilih gaya video dan platform yang paling sesuai dengan audiens Anda.</p></div><div className="p-6 bg-white rounded-lg shadow-md"><h3 className="font-bold text-xl mb-2">Hemat Waktu & Tenaga</h3><p className="text-gray-600">Tidak perlu lagi pusing memikirkan ide konten. Fokus pada produksi!</p></div></div></section>
    </div>
);

const AnalysisModal = ({ show, onClose, analysisResult, isLoading }) => {
    if (!show) return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">✨ Analisis & Ide</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button></div>{isLoading ? (<div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-4">AI sedang menganalisis...</p></div>) : (<div className="whitespace-pre-wrap text-gray-700">{analysisResult.split('\n\n').map((section, index) => {const [title, ...content] = section.split('\n'); return (<div key={index} className="mb-4"><h3 className="font-bold text-indigo-700 text-lg">{title}</h3><p className="mt-1">{content.join('\n')}</p></div>);})}</div>)}</div></div>);
};

const GeneratorPage = ({ user, setPage }) => {
    const [productName, setProductName] = useState('');
    const [affiliateLink, setAffiliateLink] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [description, setDescription] = useState('');
    const [videoStyle, setVideoStyle] = useState('testimonial');
    const [platforms, setPlatforms] = useState({ tiktok: true, reels: false, shorts: false });
    const [isLoading, setIsLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState('');
    const [generatedHashtags, setGeneratedHashtags] = useState('');
    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    const handlePlatformChange = (e) => setPlatforms({ ...platforms, [e.target.name]: e.target.checked });

    const handleGenerate = async () => {
        if (!user) { alert("Silakan login terlebih dahulu."); setPage('login'); return; }
        if (!productName || !targetAudience || !description) { setError('Harap isi semua kolom yang wajib diisi.'); return; }
        setError(''); setIsLoading(true); setGeneratedScript(''); setGeneratedHashtags('');
        
        // --- SIMULASI AI ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        const resultText = `**PEMBUKAAN**\nHalo para ${targetAudience}!\n\n**HOOK**\nStop scrolling! Kalian nggak akan percaya betapa mudahnya hidup kalian dengan ${productName} ini.\n\n**MANFAAT PRODUK**\nIni beneran game-changer karena ${description}.\n\n**CALL TO ACTION (CTA)**\nLangsung aja klik keranjang kuning atau link di bio buat dapetin ${productName}!\n\n**PENUTUP**\nJangan sampai nyesel ya!\n\n---HASHTAG---\n#${productName.replace(/\s/g, '')} #RekomendasiProduk #BarangViral`;
        const scriptPart = resultText.split('---HASHTAG---')[0].trim();
        const hashtagPart = resultText.split('---HASHTAG---')[1] ? resultText.split('---HASHTAG---')[1].trim() : '';
        setGeneratedScript(scriptPart);
        setGeneratedHashtags(hashtagPart);
        setIsLoading(false);
        // --- AKHIR SIMULASI ---
    };
    
    const handleAnalysis = async () => {
        setIsAnalyzing(true); setShowAnalysisModal(true);
        // --- SIMULASI ANALISIS ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalysisResult(`**ANALISIS AUDIENS**\nTarget audiens Anda, ${targetAudience}, kemungkinan besar tertarik pada solusi praktis.\n\n**IDE HOOK ALTERNATIF**\n1. "Cuma butuh 3 detik buat hidupmu lebih gampang."\n2. "Produk ini lagi viral banget, emang sebagus itu?"`);
        setIsAnalyzing(false);
        // --- AKHIR SIMULASI ---
    };

    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert('Skrip berhasil disalin!'); };
    const downloadScript = () => { const element = document.createElement("a"); const file = new Blob([generatedScript + "\n\n" + generatedHashtags], {type: 'text/plain'}); element.href = URL.createObjectURL(file); element.download = `${productName.replace(/\s/g, '_')}_script.txt`; document.body.appendChild(element); element.click(); };
    const proStyles = ['gaul', 'persuasive', 'storytelling'];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <AnalysisModal show={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} analysisResult={analysisResult} isLoading={isAnalyzing} />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generator Skrip Video</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md"><div className="space-y-4"><div><label className="font-bold">Nama Produk *</label><input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-2 border rounded mt-1" /></div><div><label className="font-bold">Link Afiliasi</label><input type="text" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} className="w-full p-2 border rounded mt-1" /></div><div><label className="font-bold">Target Audiens *</label><input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Contoh: Mahasiswa" className="w-full p-2 border rounded mt-1" /></div><div><label className="font-bold">Deskripsi & Manfaat Utama *</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Contoh: Membuat masakan lebih cepat" className="w-full p-2 border rounded mt-1 h-24"></textarea></div><div><label className="font-bold">Gaya Video *</label><div className="mt-2 grid grid-cols-2 gap-2"><label className="flex items-center"><input type="radio" name="style" value="testimonial" checked={videoStyle === 'testimonial'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Testimonial</label><label className="flex items-center"><input type="radio" name="style" value="komedi" checked={videoStyle === 'komedi'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Komedi</label><label className="flex items-center"><input type="radio" name="style" value="formal" checked={videoStyle === 'formal'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Formal</label><label className="flex items-center"><input type="radio" name="style" value="unboxing" checked={videoStyle === 'unboxing'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Unboxing</label>{proStyles.map(style => (<label key={style} className={`flex items-center capitalize ${user?.role !== 'pro' ? 'text-gray-400 cursor-not-allowed' : ''}`}><input type="radio" name="style" value={style} checked={videoStyle === style} onChange={e => setVideoStyle(e.target.value)} className="mr-2" disabled={user?.role !== 'pro'}/> {style} {user?.role !== 'pro' && <LockIcon />}</label>))}</div>{user?.role !== 'pro' && <p className="text-sm text-indigo-600 mt-2">Upgrade ke Pro untuk gaya lain!</p>}</div><div><label className="font-bold">Platform *</label><div className="mt-2 flex space-x-4"><label><input type="checkbox" name="tiktok" checked={platforms.tiktok} onChange={handlePlatformChange} className="mr-2"/> TikTok</label><label><input type="checkbox" name="reels" checked={platforms.reels} onChange={handlePlatformChange} className="mr-2"/> Reels</label><label><input type="checkbox" name="shorts" checked={platforms.shorts} onChange={handlePlatformChange} className="mr-2"/> Shorts</label></div></div><button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"> {isLoading ? 'Membuat Skrip...' : '✨ Generate Script'}</button>{error && <p className="text-red-500 text-sm mt-2">{error}</p>}</div></div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner"><h2 className="text-xl font-bold mb-4">Hasil Skrip Anda</h2>{isLoading && <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-4">AI sedang berpikir...</p></div>}{!isLoading && !generatedScript && <div className="text-center text-gray-500 py-10"><p>Hasil skrip akan muncul di sini.</p></div>}{generatedScript && (<div className="whitespace-pre-wrap bg-white p-4 rounded-md shadow-sm">{generatedScript.split('\n\n').map((section, index) => { const [title, ...content] = section.split('\n'); return (<div key={index} className="mb-4"><h3 className="font-bold text-indigo-700">{title}</h3><p className="text-gray-700">{content.join('\n')}</p></div>);})}</div>)}{generatedHashtags && (<div className="mt-6"><h3 className="text-lg font-bold mb-2">Template Hashtag</h3><div className="bg-white p-4 rounded-md shadow-sm text-gray-700">{generatedHashtags}</div></div>)}{generatedScript && (<div className="mt-6 flex flex-col gap-3"><button onClick={handleAnalysis} disabled={isAnalyzing} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300"><SparklesIcon />{isAnalyzing ? 'Menganalisis...' : 'Analisis & Ide Hook'}</button><div className="flex flex-col sm:flex-row gap-3"><button onClick={() => copyToClipboard(generatedScript + "\n\n" + generatedHashtags)} className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Salin Skrip</button>{user?.role === 'pro' ? (<button onClick={downloadScript} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Unduh (.txt)</button>) : (<button onClick={() => setPage('pricing')} className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"><LockIcon /> Upgrade</button>)}</div></div>)}{user?.role !== 'pro' && !isLoading && (<div className="mt-8 p-4 bg-gray-200 rounded-lg text-center text-gray-600"><p className="font-bold">Area Iklan</p><p className="text-sm">Upgrade ke Pro untuk bebas iklan.</p></div>)}</div>
            </div>
        </div>
    );
};

const PricingPage = ({ user, setPage }) => {
    const handleUpgrade = () => { if (!user) { alert("Silakan login untuk upgrade."); setPage('login'); return; } alert("Fitur pembayaran sedang dalam pengembangan."); };
    const Feature = ({ children, isPro }) => (<li className="flex items-center">{isPro ? <CheckCircleIcon /> : <XCircleIcon />}<span>{children}</span></li>);
    return (<div className="container mx-auto p-4 md:p-8"><h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">Paket Kami</h1><p className="text-center text-gray-600 max-w-xl mx-auto mb-12">Pilih paket yang paling sesuai dengan kebutuhan Anda.</p><div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"><div className="border rounded-lg p-8"><h2 className="text-2xl font-bold">Gratis</h2><p className="text-gray-500">Untuk memulai</p><p className="text-4xl font-bold my-4">Rp 0</p><ul className="space-y-3"><Feature isPro={true}>5 Generate Harian</Feature><Feature isPro={true}>Gaya Video Dasar</Feature><Feature isPro={false}>Download Skrip</Feature><Feature isPro={false}>Riwayat Generator</Feature><Feature isPro={false}>Tanpa Iklan</Feature></ul></div><div className="border-2 border-indigo-600 rounded-lg p-8 relative"><span className="absolute top-0 -translate-y-1/2 bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">Populer</span><h2 className="text-2xl font-bold text-indigo-600">Pro</h2><p className="text-gray-500">Untuk kreator serius</p><p className="text-4xl font-bold my-4">Rp 99.000<span className="text-lg font-normal">/bulan</span></p><ul className="space-y-3"><Feature isPro={true}>Generate Tanpa Batas</Feature><Feature isPro={true}>Semua Gaya Video</Feature><Feature isPro={true}>Download Skrip (.txt)</Feature><Feature isPro={true}>Riwayat Generator</Feature><Feature isPro={true}>Bebas Iklan</Feature></ul><button onClick={handleUpgrade} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Upgrade ke Pro</button></div></div></div>);
};

const DashboardPage = ({ user }) => {
    const [history, setHistory] = useState<ScriptHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { if (user?.role === 'pro') { const fetchHistory = async () => { try { const q = query(collection(db, "users", user.uid, "scripts")); const querySnapshot = await getDocs(q); const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScriptHistory[]; historyData.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()); setHistory(historyData); } catch (e) { console.error("Error fetching history: ", e); } finally { setIsLoading(false); } }; fetchHistory(); } else { setIsLoading(false); } }, [user]);
    if (!user) { return <p>Silakan login untuk melihat dashboard.</p>; }
    return (<div className="container mx-auto p-4 md:p-8"><h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1><div className="bg-white p-6 rounded-lg shadow-md mb-8"><h2 className="text-xl font-bold mb-2">Informasi Akun</h2><p><strong>Email:</strong> {user.email}</p><p><strong>Status:</strong> <span className={`font-bold ${user.role === 'pro' ? 'text-indigo-600' : (user.role === 'admin' ? 'text-red-600' : 'text-gray-600')}`}>{user.role.toUpperCase()}</span></p></div>{user.role === 'pro' && (<div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold mb-4">Riwayat Skrip Anda</h2>{isLoading && <p>Memuat riwayat...</p>}{!isLoading && history.length === 0 && <p>Anda belum memiliki riwayat.</p>}{!isLoading && history.length > 0 && (<div className="space-y-4">{history.map(item => (<div key={item.id} className="border p-4 rounded-md"><p className="font-bold">{item.productName}</p><p className="text-sm text-gray-500">Gaya: {item.videoStyle} | Dibuat: {item.createdAt.toDate().toLocaleDateString()}</p><details className="mt-2"><summary className="cursor-pointer text-indigo-600">Lihat Skrip</summary><pre className="whitespace-pre-wrap bg-gray-50 p-2 mt-2 rounded">{item.generatedScript}</pre>{item.generatedHashtags && <pre className="whitespace-pre-wrap bg-gray-50 p-2 mt-2 rounded">{item.generatedHashtags}</pre>}</details></div>))}</div>)}</div>)}</div>);
};

const LoginPage = ({ setPage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleAuth = async (e) => { e.preventDefault(); setError(''); try { if (isLogin) { await signInWithEmailAndPassword(auth, email, password); } else { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, "users", userCredential.user.uid), { uid: userCredential.user.uid, email: userCredential.user.email, role: "free", createdAt: new Date() }); } } catch (err) { const firebaseError = err as { message?: string }; setError(firebaseError.message || 'Terjadi kesalahan'); } };
    const handleGoogleLogin = async () => { setError(''); const provider = new GoogleAuthProvider(); try { const result = await signInWithPopup(auth, provider); const user = result.user; const userDocRef = doc(db, "users", user.uid); const userDoc = await getDoc(userDocRef); if (!userDoc.exists()) { await setDoc(userDocRef, { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role: "free", createdAt: new Date() }); } } catch (err) { const firebaseError = err as { message?: string }; setError(firebaseError.message || 'Terjadi kesalahan'); } };
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"><h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Login' : 'Register'}</h2><form onSubmit={handleAuth}><div className="mb-4"><label className="block font-bold mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required/></div><div className="mb-6"><label className="block font-bold mb-1">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required/></div>{error && <p className="text-red-500 text-sm mb-4">{error}</p>}<button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">{isLogin ? 'Login' : 'Buat Akun'}</button></form><div className="my-4 text-center text-gray-500">atau</div><button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-5 h-5 mr-2"/> Lanjutkan dengan Google</button><p className="text-center mt-6">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}<button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold ml-2">{isLogin ? 'Register' : 'Login'}</button></p></div></div>);
};

const AdminPanelPage = () => {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [midtransKey, setMidtransKey] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    useEffect(() => { const loadSettings = async () => { setIsLoading(true); const settings = await getSettings(); setGeminiApiKey(settings.geminiApiKey || ''); setMidtransKey(settings.midtransKey || ''); setIsLoading(false); }; loadSettings(); }, []);
    const handleSave = async () => { setMessage(''); try { const settingsDocRef = doc(db, 'settings', 'config'); await setDoc(settingsDocRef, { geminiApiKey: geminiApiKey, midtransKey: midtransKey }, { merge: true }); setMessage('Pengaturan berhasil disimpan!'); } catch (error) { const saveError = error as { message?: string }; setMessage(`Gagal menyimpan: ${saveError.message || 'Error tidak diketahui'}`); } };
    if (isLoading) { return <div className="text-center p-10">Memuat pengaturan...</div>; }
    return (<div className="container mx-auto p-4 md:p-8"><h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1><div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"><div className="space-y-6"><div><label className="font-bold text-gray-700">Gemini API Key</label><p className="text-sm text-gray-500 mb-2">Kunci API untuk AI Gemini.</p><input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} className="w-full p-2 border rounded" placeholder="Masukkan kunci API Gemini"/></div><div><label className="font-bold text-gray-700">Midtrans Client Key</label><p className="text-sm text-gray-500 mb-2">Kunci untuk pembayaran Midtrans.</p><input type="password" value={midtransKey} onChange={e => setMidtransKey(e.target.value)} className="w-full p-2 border rounded" placeholder="Masukkan kunci client Midtrans"/></div><button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Simpan Pengaturan</button>{message && <p className={`text-sm mt-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}</div></div></div>);
};

// --- Komponen Utama Aplikasi ---
export default function App() {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ uid: currentUser.uid, email: currentUser.email, ...userDoc.data() });
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email, role: 'free' });
                }
                if (page === 'login') {
                    setPage('generator');
                }
            } else {
                setUser(null);
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [page]);

    const handleLogout = async () => { await signOut(auth); setPage('home'); };
    const renderPage = () => {
        switch (page) {
            case 'generator': return <GeneratorPage user={user} setPage={setPage} />;
            case 'pricing': return <PricingPage user={user} setPage={setPage} />;
            case 'dashboard': return user ? <DashboardPage user={user} /> : <LoginPage setPage={setPage} />;
            case 'login': return <LoginPage setPage={setPage} />;
            case 'admin': return user?.role === 'admin' ? <AdminPanelPage /> : <HomePage setPage={setPage} />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    if (loadingAuth) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <nav className="bg-white shadow-sm sticky top-0 z-50"><div className="container mx-auto px-4 py-3 flex justify-between items-center"><div className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => setPage('home')}>ScriptGen</div><div className="hidden md:flex items-center space-x-6"><button onClick={() => setPage('home')} className="text-gray-600 hover:text-indigo-600">Home</button><button onClick={() => setPage('generator')} className="text-gray-600 hover:text-indigo-600">Generator</button><button onClick={() => setPage('pricing')} className="text-gray-600 hover:text-indigo-600">Paket Pro</button>{user && <button onClick={() => setPage('dashboard')} className="text-gray-600 hover:text-indigo-600">Dashboard</button>}{user?.role === 'admin' && <button onClick={() => setPage('admin')} className="text-red-600 font-bold hover:text-red-800">Admin Panel</button>}</div><div>{user ? (<button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">Logout</button>) : (<button onClick={() => setPage('login')} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">Login</button>)}</div></div></nav>
            <main>{renderPage()}</main>
            <footer className="bg-gray-800 text-white text-center p-6 mt-12"><p>&copy; 2025 ScriptGen. Dibuat untuk para Affiliate Juara.</p></footer>
        </div>
    );
}

