'use client'; // <-- WAJIB DITAMBAHKAN DI ATAS

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
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
    updateDoc
} from 'firebase/firestore';

// --- Konfigurasi Firebase ---
// Ganti dengan konfigurasi Firebase Anda sendiri
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- Inisialisasi Firebase ---
// Melakukan pengecekan untuk menghindari inisialisasi ganda
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization error:", e);
}
const auth = getAuth(app);
const db = getFirestore(app);

// --- Fungsi untuk mengambil Konfigurasi ---
const getSettings = async () => {
    try {
        const settingsDocRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.warn("Dokumen 'settings/config' tidak ditemukan. Harap konfigurasikan di Admin Panel.");
            return {};
        }
    } catch (error) {
        console.error("Gagal mengambil pengaturan:", error);
        return {};
    }
};


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
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
                Ubah Produk Jadi <span className="text-indigo-600">Cuan</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Buat skrip video viral untuk TikTok, Reels, & Shorts dalam hitungan detik dengan kekuatan AI.
            </p>
            <button
                onClick={() => setPage('generator')}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
            >
                Coba Gratis Sekarang!
            </button>
        </header>

        <section id="features" className="py-16 bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">Fitur Unggulan Kami</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="font-bold text-xl mb-2">Generator Cerdas</h3>
                    <p className="text-gray-600">AI kami merancang skrip yang terstruktur dari hook hingga call to action.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="font-bold text-xl mb-2">Beragam Gaya & Platform</h3>
                    <p className="text-gray-600">Pilih gaya video dan platform yang paling sesuai dengan audiens Anda.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="font-bold text-xl mb-2">Hemat Waktu & Tenaga</h3>
                    <p className="text-gray-600">Tidak perlu lagi pusing memikirkan ide konten. Fokus pada produksi!</p>
                </div>
            </div>
        </section>
    </div>
);

const AnalysisModal = ({ show, onClose, analysisResult, isLoading }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">✨ Analisis & Ide</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                {isLoading ? (
                     <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-4">AI sedang menganalisis...</p></div>
                ) : (
                    <div className="whitespace-pre-wrap text-gray-700">
                        {analysisResult.split('\n\n').map((section, index) => {
                            const [title, ...content] = section.split('\n');
                            return (
                                <div key={index} className="mb-4">
                                    <h3 className="font-bold text-indigo-700 text-lg">{title}</h3>
                                    <p className="mt-1">{content.join('\n')}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
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

    // State untuk fitur analisis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    const handlePlatformChange = (e) => {
        setPlatforms({ ...platforms, [e.target.name]: e.target.checked });
    };
    
    const saveScriptToHistory = async (script, hashtags) => {
        if (!user || user.role !== 'pro') return;
        try {
            await addDoc(collection(db, "users", user.uid, "scripts"), {
                productName,
                targetAudience,
                videoStyle,
                platform: Object.keys(platforms).filter(p => platforms[p]),
                generatedScript: script,
                generatedHashtags: hashtags,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const callGeminiAPI = async (prompt) => {
        // Ambil API key dari Firestore
        const settings = await getSettings();
        const apiKey = settings.geminiApiKey || "";

        if (!apiKey) {
            throw new Error("Gemini API Key tidak ditemukan. Harap atur di Admin Panel.");
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Error Body:", errorBody);
            throw new Error(`Panggilan API gagal: ${response.status}. Pesan: ${errorBody.error?.message || 'Tidak ada detail'}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Invalid response structure:", result);
            if (result.candidates && result.candidates[0].finishReason) {
                throw new Error(`Pembuatan konten dihentikan. Alasan: ${result.candidates[0].finishReason}`);
            }
            throw new Error("Struktur respons dari API tidak valid.");
        }
    };

    const handleGenerate = async () => {
        if (!user) {
            alert("Silakan login terlebih dahulu untuk menggunakan generator.");
            setPage('login');
            return;
        }
        
        if (!productName || !targetAudience || !description) {
            setError('Harap isi semua kolom yang wajib diisi.');
            return;
        }
        
        setError('');
        setIsLoading(true);
        setGeneratedScript('');
        setGeneratedHashtags('');
        setAnalysisResult('');

        const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]).join(', ');

        const prompt = `
            Anda adalah seorang ahli pembuat skrip video marketing viral untuk media sosial.
            Tugas Anda adalah membuat skrip video berdasarkan detail berikut:

            Detail Produk:
            - Nama Produk: ${productName}
            - Deskripsi & Manfaat Utama: ${description}
            - Link Afiliasi: ${affiliateLink || 'Tidak ada'}
            - Target Audiens: ${targetAudience}

            Kebutuhan Video:
            - Platform: ${selectedPlatforms}
            - Gaya Video: ${videoStyle}

            Buatlah skrip dengan struktur WAJIB berikut, dipisahkan oleh baris baru ganda:
            **PEMBUKAAN**
            (1-3 detik): Sapa audiens sesuai targetnya.

            **HOOK**
            (3-5 detik): Buat kalimat pembuka yang sangat menarik perhatian, penasaran, atau mengejutkan sesuai gaya video yang diminta.

            **MANFAAT PRODUK**
            (15-20 detik): Jelaskan 2-3 manfaat utama produk dengan bahasa yang mudah dimengerti oleh target audiens. Fokus pada solusi yang ditawarkan produk, bukan hanya fitur.

            **CALL TO ACTION (CTA)**
            (5 detik): Ajak penonton untuk mengklik link di bio atau keranjang kuning. Gunakan kalimat yang persuasif. Sebutkan nama produk dengan jelas.

            **PENUTUP**
            (1-3 detik): Kalimat singkat untuk mengakhiri video.

            Setelah skrip, buatkan juga 5 template hashtag yang relevan untuk postingan ini di bawah penanda "---HASHTAG---".

            Pastikan bahasa yang digunakan konsisten dengan gaya ${videoStyle} dan cocok untuk platform ${selectedPlatforms}.
            HASILKAN HANYA TEKS SKRIP DAN HASHTAGNYA SESUAI FORMAT.
        `;

        try {
            const resultText = await callGeminiAPI(prompt);
            const scriptPart = resultText.split('---HASHTAG---')[0].trim();
            const hashtagPart = resultText.split('---HASHTAG---')[1] ? resultText.split('---HASHTAG---')[1].trim() : '';

            setGeneratedScript(scriptPart);
            setGeneratedHashtags(hashtagPart);
            
            if (user.role === 'pro') {
                saveScriptToHistory(scriptPart, hashtagPart);
            }

        } catch (e) {
            setError(`Terjadi kesalahan: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalysis = async () => {
        if (!generatedScript) return;

        setIsAnalyzing(true);
        setShowAnalysisModal(true);
        setError('');

        const prompt = `
            Anda adalah seorang direktur kreatif dan ahli strategi media sosial.
            Analisis skrip video dan detail produk berikut untuk memberikan ide-ide cemerlang.

            **Detail Produk:**
            - Nama Produk: ${productName}
            - Deskripsi: ${description}
            - Target Audiens: ${targetAudience}

            **Skrip yang Dihasilkan:**
            ${generatedScript}

            Berikan analisis dan saran dalam format berikut, dipisahkan oleh baris baru ganda:

            **ANALISIS AUDIENS**
            Berdasarkan target audiens "${targetAudience}", jelaskan secara singkat apa yang kemungkinan besar menarik perhatian mereka terkait produk ini.

            **IDE HOOK ALTERNATIF**
            Berikan 2-3 ide hook (kalimat pembuka) alternatif yang berbeda namun tetap menarik dan sesuai dengan gaya video.

            **SARAN VISUAL**
            Berikan 3 saran visual atau adegan singkat yang bisa dilakukan untuk membuat video lebih dinamis dan menarik. Contoh: "Mulai dengan close-up produk", "Tunjukkan ekspresi kaget saat hook".
        `;

        try {
            const resultText = await callGeminiAPI(prompt);
            setAnalysisResult(resultText);
        } catch (e) {
            setAnalysisResult(`Gagal menganalisis: ${e.message}`);
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Skrip berhasil disalin!');
    };
    
    const downloadScript = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedScript + "\n\n" + generatedHashtags], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${productName.replace(/\s/g, '_')}_script.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const proStyles = ['gaul', 'persuasive', 'storytelling'];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <AnalysisModal 
                show={showAnalysisModal} 
                onClose={() => setShowAnalysisModal(false)}
                analysisResult={analysisResult}
                isLoading={isAnalyzing}
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generator Skrip Video</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Kolom Input */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="space-y-4">
                        <div>
                            <label className="font-bold">Nama Produk *</label>
                            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">Link Afiliasi</label>
                            <input type="text" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">Target Audiens *</label>
                            <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga" className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">Deskripsi & Manfaat Utama *</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Contoh: Membuat masakan lebih cepat matang" className="w-full p-2 border rounded mt-1 h-24"></textarea>
                        </div>
                        <div>
                            <label className="font-bold">Gaya Video *</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <label className="flex items-center"><input type="radio" name="style" value="testimonial" checked={videoStyle === 'testimonial'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Testimonial</label>
                                <label className="flex items-center"><input type="radio" name="style" value="komedi" checked={videoStyle === 'komedi'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Komedi</label>
                                <label className="flex items-center"><input type="radio" name="style" value="formal" checked={videoStyle === 'formal'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Formal Edukatif</label>
                                <label className="flex items-center"><input type="radio" name="style" value="unboxing" checked={videoStyle === 'unboxing'} onChange={e => setVideoStyle(e.target.value)} className="mr-2"/> Unboxing</label>
                                {proStyles.map(style => (
                                    <label key={style} className={`flex items-center capitalize ${user?.role !== 'pro' ? 'text-gray-400 cursor-not-allowed' : ''}`}>
                                        <input type="radio" name="style" value={style} checked={videoStyle === style} onChange={e => setVideoStyle(e.target.value)} className="mr-2" disabled={user?.role !== 'pro'}/> 
                                        {style} {user?.role !== 'pro' && <LockIcon />}
                                    </label>
                                ))}
                            </div>
                             {user?.role !== 'pro' && <p className="text-sm text-indigo-600 mt-2">Upgrade ke Pro untuk membuka lebih banyak gaya!</p>}
                        </div>
                        <div>
                            <label className="font-bold">Platform *</label>
                            <div className="mt-2 flex space-x-4">
                                <label><input type="checkbox" name="tiktok" checked={platforms.tiktok} onChange={handlePlatformChange} className="mr-2"/> TikTok</label>
                                <label><input type="checkbox" name="reels" checked={platforms.reels} onChange={handlePlatformChange} className="mr-2"/> Instagram Reels</label>
                                <label><input type="checkbox" name="shorts" checked={platforms.shorts} onChange={handlePlatformChange} 
