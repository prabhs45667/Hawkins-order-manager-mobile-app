import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { parseReadme } from './data/parseProducts'
import readmeRaw from '../data.md?raw'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { savePDFToLocal, getLocalHistory, deleteLocalPDF, renameLocalPDF, saveCustomPdf, getCustomPdfs, deleteCustomPdf, saveMrpOverride, getMrpOverrides, saveCustomProduct, getCustomProducts, saveClientBill, getClients, updateClientPayment, createManualClient, addManualBill, editClientRecord, deleteClientRecord, saveBillDetails, getBillDetails, saveDailyNote as saveDailyNoteLocal, getDailyNotes as getDailyNotesLocal, exportAllData, importAllData, saveManualSale, getManualSales, deleteManualSale, deleteLocalDailyNote } from './idb'

import { isNative, openBundledPdf, saveAndOpenPdf, saveToDevice, openWithNativeViewer } from './nativePdf'
import { queueSync, restoreFromCloud, saveBillToCloud, saveOrderToCloud, fetchDailySales, saveDailyNoteToCloud, addSyncListener, removeSyncListener, checkApiHealth, saveManualSaleToCloud, deleteManualSaleFromCloud, deleteNoteFromCloud } from './api'
import { sendBillEmail, sendOrderEmail, sendDailySalesEmail, sendHistoryPdfEmail } from './emailService'

// Error Boundary like check
if (typeof window !== 'undefined') {
    window.onerror = function (msg, url, line) {
        console.error("Global Error: " + msg + " at " + url + ":" + line);
        // Alert only for debugging if needed: alert("Error: " + msg);
    };
}

const sections = parseReadme(readmeRaw)
const allItems = []
sections.forEach(s => {
    allItems.push(...s.items)
    s.subsections.forEach(sub => allItems.push(...sub.items))
})

const PdfCanvas = ({ src }) => {
    const containerRef = React.useRef(null)
    const [numPages, setNumPages] = useState(0)
    const [zoom, setZoom] = useState(100)

    useEffect(() => {
        if (!src) return;
        const renderPdf = async () => {
            try {
                if (!window.pdfjsLib) {
                    console.warn("pdfjsLib not loaded yet...");
                    containerRef.current.innerHTML = '<p style="padding: 20px; text-align: center;">Loading PDF engine...</p>';
                    setTimeout(renderPdf, 1000);
                    return;
                }
                const loadingTask = window.pdfjsLib.getDocument(src)
                const pdf = await loadingTask.promise
                setNumPages(pdf.numPages)
                containerRef.current.innerHTML = ''

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i)
                    // Render with high resolution inherently
                    const viewport = page.getViewport({ scale: 2.0 })
                    const canvas = document.createElement('canvas')
                    const context = canvas.getContext('2d')
                    canvas.height = viewport.height
                    canvas.width = viewport.width
                    // The CSS width will be handled by the zoom effect
                    canvas.style.width = `${zoom}%`
                    canvas.style.marginBottom = '12px'
                    canvas.style.borderRadius = '8px'
                    canvas.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                    containerRef.current.appendChild(canvas)
                    await page.render({ canvasContext: context, viewport }).promise
                }
            } catch (e) {
                console.error('PDF Render Error:', e)
                if (containerRef.current) {
                    containerRef.current.innerHTML = '<p style="color: red; padding: 20px;">Failed to render PDF</p>'
                }
            }
        }
        renderPdf()
    }, [src])

    useEffect(() => {
        if (containerRef.current) {
            const canvases = containerRef.current.querySelectorAll('canvas');
            canvases.forEach(c => c.style.width = `${zoom}%`);
        }
    }, [zoom]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '10px', background: '#f0f1f4', borderBottom: '1px solid var(--border)' }}>
                 <button onClick={() => setZoom(z => Math.max(50, z - 25))} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #ccc', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                 <span style={{ fontWeight: '800', width: '60px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text)' }}>{zoom}%</span>
                 <button onClick={() => setZoom(z => Math.min(300, z + 25))} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #ccc', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#e0e0e0', padding: 16, textAlign: 'center' }}>
                <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} />
            </div>
        </div>
    )
}

export default function App() {
    const [tab, setTab] = useState('catalog')
    const [search, setSearch] = useState('')
    const [orders, setOrders] = useState({}) // { itemId: { type: 'box'|'pcs', qty: N } }
    const [billInputs, setBillInputs] = useState({})
    const [customItems, setCustomItems] = useState([])
    const [activePdf, setActivePdf] = useState(null)
    const [addModal, setAddModal] = useState(false)
    const [customForm, setCustomForm] = useState({ name: '', code: '', mrp: '', casePack: '', brand: '', options: '' })
    const [openSections, setOpenSections] = useState({})
    const [imgModal, setImgModal] = useState(null)
    const [toast, setToast] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customPdfs, setCustomPdfs] = useState([])
    const [pdfModal, setPdfModal] = useState(false)
    const [pdfForm, setPdfForm] = useState({ name: '', file: null })
    const [historyItems, setHistoryItems] = useState([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [customBillItems, setCustomBillItems] = useState([])
    const [customBillInputs, setCustomBillInputs] = useState({ name: '', code: '', boxQty: '', pcsQty: '', mrp: '', discount: '' })
    const [activeBrand, setActiveBrand] = useState('All')
    const [historySearch, setHistorySearch] = useState('')
    const [mrpOverrides, setMrpOverrides] = useState({})
    const [mrpEditId, setMrpEditId] = useState(null)
    const [mrpEditVal, setMrpEditVal] = useState('')
    const [clientsList, setClientsList] = useState([])
    const [activeClient, setActiveClient] = useState(null)
    const [activeClientFilter, setActiveClientFilter] = useState('All')
    const [paymentInput, setPaymentInput] = useState('')
    const [billInput, setBillInput] = useState('')
    const [manualEntry, setManualEntry] = useState(null)
    const [entryForm, setEntryForm] = useState({ amount: '', date: '', time: '', reason: '' })
    const [editEntry, setEditEntry] = useState(null)
    const [editForm, setEditForm] = useState({ amount: '', date: '', time: '', reason: '' })
    const [clientModal, setClientModal] = useState(false)
    const [clientForm, setClientForm] = useState({ name: '' })
    // Cloud Sync state
    const [syncStatus, setSyncStatus] = useState('offline') // synced | syncing | pending | error | offline
    // Daily Sales state
    const [dailySalesData, setDailySalesData] = useState([])
    const [openSalesDays, setOpenSalesDays] = useState({})
    const [dailyNotes, setDailyNotes] = useState({})
    const [dailyNoteEditing, setDailyNoteEditing] = useState({})
    const [isLoadingSales, setIsLoadingSales] = useState(false)
    const [manualSaleModal, setManualSaleModal] = useState(false)
    const [manualSaleForm, setManualSaleForm] = useState({ date: '', pieces: '', amount: '', notes: '' })
    const [manualSalesList, setManualSalesList] = useState([])
    const [emailSending, setEmailSending] = useState(false)
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

    // Trigger cloud sync after data changes
    const triggerCloudSync = useCallback(async () => {
        try {
            const data = await exportAllData();
            queueSync(data);
        } catch (e) {
            console.error('Failed to queue cloud sync:', e);
        }
    }, []);

    // Load persistent data on mount & attempt cloud restore if local is empty
    useEffect(() => {
        // Listen for sync status changes
        const onSyncStatus = (status) => setSyncStatus(status);
        addSyncListener(onSyncStatus);

        (async () => {
            let localHasData = false;
            try {
                const saved = await getCustomPdfs();
                if (saved && saved.length > 0) {
                    setCustomPdfs(saved.map(p => ({ name: p.name, src: p.data })));
                }
            } catch (e) { console.error('Failed to load custom PDFs:', e); }
            try {
                const overrides = await getMrpOverrides();
                if (overrides && Object.keys(overrides).length > 0) {
                    setMrpOverrides(overrides);
                    localHasData = true;
                }
            } catch (e) { console.error('Failed to load MRP overrides:', e); }
            try {
                const savedProducts = await getCustomProducts();
                if (savedProducts && savedProducts.length > 0) {
                    setCustomItems(savedProducts);
                    localHasData = true;
                }
            } catch (e) { console.error('Failed to load custom products:', e); }
            try {
                const savedClients = await getClients();
                if (savedClients && savedClients.length > 0) {
                    localHasData = true;
                }
                setClientsList(savedClients);
            } catch (e) { console.error('Failed to load clients:', e); }

            // If local DB is empty, try to restore from cloud
            if (!localHasData) {
                try {
                    const isOnline = await checkApiHealth();
                    if (isOnline) {
                        showToast('🔄 Restoring data from cloud...');
                        const cloudData = await restoreFromCloud();
                        if (cloudData) {
                            await importAllData(cloudData);
                            // Reload from local after import
                            const clients = await getClients();
                            setClientsList(clients);
                            const products = await getCustomProducts();
                            setCustomItems(products);
                            const overrides = await getMrpOverrides();
                            setMrpOverrides(overrides);
                            showToast('✅ Data restored from cloud!');
                            setSyncStatus('synced');
                        } else {
                            setSyncStatus('synced');
                        }
                    } else {
                        setSyncStatus('offline');
                    }
                } catch (e) {
                    console.error('Cloud restore failed:', e);
                    setSyncStatus('error');
                }
            } else {
                // Local has data — do an initial sync to cloud
                try {
                    const isOnline = await checkApiHealth();
                    if (isOnline) {
                        setSyncStatus('synced');
                        // Sync current local data to cloud
                        const data = await exportAllData();
                        queueSync(data);
                    } else {
                        setSyncStatus('offline');
                    }
                } catch (e) {
                    setSyncStatus('offline');
                }
            }

            // Load daily notes from local
            try {
                const notes = await getDailyNotesLocal();
                setDailyNotes(notes);
            } catch (e) { console.error('Failed to load daily notes:', e); }

            // Load manual sales from local
            try {
                const mSales = await getManualSales();
                setManualSalesList(mSales);
            } catch (e) { console.error('Failed to load manual sales:', e); }

            // Midnight auto-sales check: if the day has changed, reload sales
            try {
                const today = new Date().toISOString().split('T')[0];
                const lastDate = localStorage.getItem('hawkins_last_open_date');
                if (lastDate && lastDate !== today) {
                    // New day detected — the sales tab will auto-update when opened
                    console.log('New day detected. Daily sales will refresh on Sales tab open.');
                }
                localStorage.setItem('hawkins_last_open_date', today);
            } catch (e) { /* ignore localStorage errors */ }
        })();

        return () => removeSyncListener(onSyncStatus);
    }, []);

    const loadHistory = async () => {
        setIsLoadingHistory(true)
        try {
            const localData = await getLocalHistory()
            const combined = localData.map(i => ({ ...i, type: 'Local' })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setHistoryItems(combined)
        } catch (e) {
            console.error("History load error:", e)
        }
        setIsLoadingHistory(false)
    }

    // Load daily sales data
    const loadDailySales = async () => {
        setIsLoadingSales(true);
        try {
            // Try cloud first, fallback to local
            let sales = [];
            try {
                sales = await fetchDailySales();
            } catch (e) {
                console.log('Cloud sales fetch failed, using local data');
            }

            // If cloud returned nothing, build from local billDetails
            if (!sales || sales.length === 0) {
                const localBills = await getBillDetails();
                const grouped = {};
                localBills.forEach(bill => {
                    const key = bill.dateKey;
                    if (!grouped[key]) {
                        grouped[key] = {
                            dateKey: key, date: bill.date, totalBills: 0,
                            totalPieces: 0, totalBoxes: 0, totalAmount: 0,
                            productBreakdown: {}, brandBreakdown: {}, bills: []
                        };
                    }
                    const day = grouped[key];
                    day.totalBills++;
                    day.totalPieces += bill.totalPieces || 0;
                    day.totalBoxes += bill.totalBoxes || 0;
                    day.totalAmount += bill.grandTotal || 0;
                    day.bills.push({ billId: bill.billId, customerName: bill.customerName, grandTotal: bill.grandTotal, totalPieces: bill.totalPieces, timestamp: bill.timestamp });
                    (bill.lineItems || []).forEach(item => {
                        const pk = item.name || 'Unknown';
                        if (!day.productBreakdown[pk]) day.productBreakdown[pk] = { pieces: 0, brand: item.brand || 'Hawkins' };
                        day.productBreakdown[pk].pieces += item.pieces || 0;
                        const brand = item.brand || 'Hawkins';
                        if (!day.brandBreakdown[brand]) day.brandBreakdown[brand] = 0;
                        day.brandBreakdown[brand] += item.pieces || 0;
                    });
                });
                sales = Object.values(grouped).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
            }

            // Attach notes
            const notes = await getDailyNotesLocal();
            setDailyNotes(notes);
            sales.forEach(day => { day.note = notes[day.dateKey] || ''; });

            setDailySalesData(sales);
        } catch (e) {
            console.error('Failed to load daily sales:', e);
        }
        setIsLoadingSales(false);
    }

    const deleteHistoryItem = async (filename) => {
        if (window.confirm('Are you sure you want to delete this PDF forever from your Device?')) {
            showToast('Deleting PDF...')
            try {
                await deleteLocalPDF(filename)
                showToast('Deleted cleanly')
                loadHistory()
            } catch (e) {
                showToast('Failed to delete PDF')
            }
        }
    }

    const handleImportHistoryPdf = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            showToast('Importing PDF...');
            await savePDFToLocal(file.name, file, 'Imported', null);
            showToast('PDF Imported successfully!');
            loadHistory();
        } catch (err) {
            console.error(err);
            showToast('Failed to import PDF');
        }
    }

    useEffect(() => {
        if (tab === 'history') loadHistory()
        if (tab === 'sales') loadDailySales()
    }, [tab])

    const toggleSection = (key) => {
        setOpenSections(p => ({ ...p, [key]: !p[key] }))
    }

    const updateQty = useCallback((itemId, type, delta) => {
        setOrders(prev => {
            const cur = prev[itemId]
            if (!cur && delta < 0) return prev
            const currentQty = (cur && cur.type === type) ? cur.qty : 0
            const newQty = Math.max(0, currentQty + delta)
            if (newQty === 0) {
                const next = { ...prev }
                delete next[itemId]
                return next
            }
            return { ...prev, [itemId]: { type, qty: newQty, addedAt: cur?.addedAt || Date.now() } }
        })
    }, [])

    const removeItem = useCallback((itemId) => {
        setOrders(prev => {
            const next = { ...prev }
            delete next[itemId]
            return next
        })
    }, [])

    const handleBillChange = useCallback((itemId, field, value) => {
        setBillInputs(prev => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || { mrp: '', discount: '' }), [field]: value }
        }))
    }, [])

    const handleAddCustom = async () => {
        const baseName = customForm.name || 'Custom Product';
        const finalName = customForm.options ? `${baseName} (${customForm.options})` : baseName;
        const newItem = {
            id: `custom-${Date.now()}`,
            name: finalName,
            code: customForm.code || '-',
            mrp: parseInt(customForm.mrp) || 0,
            casePack: parseInt(customForm.casePack) || 1,
            brand: customForm.brand || 'Hawkins'
        };
        try {
            await saveCustomProduct(newItem);
        } catch(e) { console.error('Failed to save to IDB', e); }
        setCustomItems(prev => [...prev, newItem])
        setAddModal(false)
        setCustomForm({ name: '', code: '', mrp: '', casePack: '', brand: '', options: '' })
        showToast('Item added!')
        triggerCloudSync();
    }

    const handleAddClient = async () => {
        if (!clientForm.name.trim()) return showToast('Client Name required');
        try {
            await createManualClient(clientForm.name);
            const updated = await getClients();
            setClientsList(updated);
            setClientModal(false);
            setClientForm({ name: '' });
            showToast('Client created successfully!');
            triggerCloudSync();
        } catch (e) {
            console.error(e);
            showToast('Failed. Name might already exist.');
        }
    }

    const handleAddPdf = async () => {
        if (!pdfForm.name || !pdfForm.file) return showToast('Please enter name and choose a file')
        try {
            // Read file as data URL for persistence
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(pdfForm.file);
            });
            await saveCustomPdf(pdfForm.name, dataUrl);
            setCustomPdfs(prev => [...prev, { name: pdfForm.name, src: dataUrl }]);
            setPdfModal(false)
            setPdfForm({ name: '', file: null })
            showToast('PDF Added & Saved!')
        } catch (e) {
            console.error('Failed to save PDF:', e);
            showToast('Failed to save PDF');
        }
    }

    const handleDeleteCustomPdf = async (pdfName) => {
        try {
            await deleteCustomPdf(pdfName);
            setCustomPdfs(prev => prev.filter(p => p.name !== pdfName));
            showToast('PDF removed');
        } catch (e) { showToast('Failed to remove PDF'); }
    }

    const handleMrpEdit = async (itemId, newMrp) => {
        const val = parseInt(newMrp) || 0;
        setMrpOverrides(prev => ({ ...prev, [itemId]: val }));
        try { await saveMrpOverride(itemId, val); } catch (e) { console.error(e); }
        setMrpEditId(null);
        setMrpEditVal('');
        showToast('MRP updated!');
        triggerCloudSync();
    }

    const allCombined = useMemo(() => [...allItems, ...customItems], [customItems])

    const orderedItems = useMemo(() => {
        return allCombined.filter(item => orders[item.id]).map(item => ({
            ...item, ...orders[item.id]
        })).sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
    }, [orders, allCombined])

    const totalCount = orderedItems.length

    const allBrands = useMemo(() => {
        const brands = new Set(['All', 'Hawkins']);
        customItems.forEach(c => c.brand && brands.add(c.brand));
        return Array.from(brands);
    }, [customItems]);

    const filteredSections = useMemo(() => {
        const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const match = (i) => {
            const itemBrand = i.brand || 'Hawkins';
            if (activeBrand !== 'All' && itemBrand !== activeBrand) return false;
            if (words.length === 0) return true;
            const nameStr = i.name.toLowerCase();
            const codeStr = String(i.code).toLowerCase();
            const brandStr = itemBrand.toLowerCase();
            return words.every(w => nameStr.includes(w) || codeStr.includes(w) || brandStr.includes(w));
        };

        let processedSections = sections.map(s => {
            const filteredItems = s.items.filter(i => match({ ...i, brand: 'Hawkins' }));
            const filteredSubs = s.subsections.map(sub => ({
                ...sub,
                items: sub.items.filter(i => match({ ...i, brand: 'Hawkins' }))
            })).filter(sub => sub.items.length > 0)
            if (filteredItems.length === 0 && filteredSubs.length === 0) return null
            return { ...s, items: filteredItems, subsections: filteredSubs }
        }).filter(Boolean)

        const customMatch = customItems.filter(match);
        if (customMatch.length > 0) {
            const brandGroups = {};
            customMatch.forEach(item => {
                const b = item.brand || 'Custom Products';
                if (!brandGroups[b]) brandGroups[b] = [];
                brandGroups[b].push(item);
            });
            
            Object.keys(brandGroups).forEach(b => {
                const existingSectionIndex = processedSections.findIndex(s => s.name.toLowerCase() === b.toLowerCase());
                if (existingSectionIndex >= 0) {
                    processedSections[existingSectionIndex].items.push(...brandGroups[b]);
                } else {
                    processedSections.push({ name: b, items: brandGroups[b], subsections: [] });
                }
            });
        }

        return processedSections
    }, [search, customItems, activeBrand])

    const openRemotePdf = async (filename) => {
        try {
            showToast('Opening PDF...');
            // Encode the filename for URLs (handles spaces and special chars)
            const encodedFilename = encodeURIComponent(filename);

            if (isNative()) {
                // First try to fetch from local bundle (public/pdf/ folder)
                try {
                    const localUrl = `/pdf/${encodedFilename}`;
                    console.log('Trying local PDF:', localUrl);
                    const response = await fetch(localUrl);
                    if (!response.ok) throw new Error(`Not found in /pdf/ (status ${response.status})`);
                    const blob = await response.blob();
                    if (blob.size < 100) throw new Error('File too small, likely not a real PDF');
                    await saveAndOpenPdf(filename, blob);
                    return;
                } catch (localErr) {
                    console.log('Local asset fetch failed, trying cloud...', localErr);
                    // Second try: Cloud Supabase
                    try {
                        const fullUrl = `${SUPABASE_PDF_URL}${encodedFilename}`;
                        console.log('Trying cloud PDF:', fullUrl);
                        const response = await fetch(fullUrl);
                        if (!response.ok) throw new Error(`Cloud file not found (status ${response.status})`);
                        const blob = await response.blob();
                        if (blob.size < 100) throw new Error('Cloud file too small');
                        await saveAndOpenPdf(filename, blob);
                        return;
                    } catch (cloudErr) {
                        console.error('Cloud fetch also failed:', cloudErr);
                        throw cloudErr;
                    }
                }
            } else {
                // Web/Browser mode — also encode spaces for browser compatibility
                setActivePdf({ name: filename, src: `/pdf/${encodedFilename}` });
            }
        } catch (e) {
            console.error('PDF open error:', e);
            showToast('Failed to open PDF. Check your connection.');
        }
    }

    const savePDF = async () => {
        if (orderedItems.length === 0) return
        const doc = new jsPDF()
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        doc.setFontSize(16)
        doc.text(`Hawkins Order - ${today}`, 14, 20)
        doc.setFontSize(10)
        const totalBoxes = orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0);
        const totalPieces = orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0);
        let headerText = `Total Items: ${orderedItems.length}`;
        if (totalBoxes > 0) headerText += ` | Total Boxes: ${totalBoxes}`;
        if (totalPieces > 0) headerText += ` | Total Pieces: ${totalPieces}`;
        doc.text(headerText, 14, 28)

        const rows = orderedItems.map((item, i) => {
            let qtyStr = '';
            if (item.type === 'box') {
                qtyStr = item.qty === 1 ? '1 Box' : `${item.qty} Boxes`;
            } else {
                qtyStr = item.qty === 1 ? '1 Piece' : `${item.qty} Pieces`;
            }
            return [i + 1, item.name, item.code, qtyStr];
        })

        if (rows.length > 0) {
            doc.autoTable({
                startY: 34,
                head: [['#', 'Product Name', 'Code', 'Quantity']],
                body: rows,
                styles: { fontSize: 10, cellPadding: 4, textColor: [0, 0, 0] },
                headStyles: { fillColor: [220, 220, 225], textColor: [0, 0, 0], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 248, 248] },
            })
        }
        // Sanitize filename
        const safeDate = today.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Hawkins_Order_${safeDate}_${Date.now()}.pdf`

        try {
            setToast('Generating Order PDF...')
            const pdfBlob = doc.output('blob')

            // 1. Save to History (IndexedDB) with extraData for edit
            const extraData = { orders, customItems };
            await savePDFToLocal(filename, pdfBlob, 'Order', extraData)

            // 2. Save Order to Daily Sales (MongoDB billrecords)
            const nowTs = Date.now();
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            
            const lineItems = orderedItems.map((item) => {
                const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty;
                return { name: item.name, code: item.code, brand: item.brand || 'Hawkins', type: item.type, qty: item.qty, pieces: totalUnits, mrp: 0, finalPrice: 0 };
            });

            const orderDetailRecord = {
                orderId: `order-${nowTs}`,
                customerName: 'Order (Unbilled)',
                date: today,
                dateKey,
                timestamp: nowTs,
                grandTotal: 0,
                totalBoxes: totalBoxes,
                totalPieces: totalPieces,
                lineItems
            };

            try { await saveBillDetails(orderDetailRecord); } catch(e) { console.error('Local order save error:', e); }
            try { await saveOrderToCloud(orderDetailRecord); } catch(e) { console.error('Cloud order save error:', e); }
            triggerCloudSync();

            // Auto-send order email
            try {
                await sendOrderEmail(orderDetailRecord);
                setToast('📧 Order emailed to you!');
            } catch(emailErr) {
                console.warn('Order email failed (non-critical):', emailErr);
            }

            if (isNative()) {
                await saveAndOpenPdf(filename, pdfBlob)
                if (!toast) setToast('Opening Order...')
            } else {
                doc.save(filename)
                if (!toast) setToast('Downloaded PDF')
            }
        } catch (e) {
            console.error(e)
            setToast('Error opening PDF')
        }
    }

    const saveBillPDF = async () => {
        if (orderedItems.length === 0 && customBillItems.length === 0) return
        const doc = new jsPDF()
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        doc.setFontSize(16)
        const title = customerName.trim() ? `Hawkins Bill - ${customerName.trim()} - ${today}` : `Hawkins Bill - ${today}`;
        doc.text(title, 14, 20)
        
        doc.setFontSize(10);
        const totalBoxes = orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.boxQty) || 0), 0);
        const totalPieces = orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.pcsQty) || 0), 0);
        let headerText = `Total Items: ${orderedItems.length + customBillItems.length}`;
        if (totalBoxes > 0) headerText += ` | Total Boxes: ${totalBoxes}`;
        if (totalPieces > 0) headerText += ` | Total Pieces: ${totalPieces}`;
        doc.text(headerText, 14, 28);

        let grandTotal = 0;

        const rows = orderedItems.map((item, i) => {
            const bData = billInputs[item.id] || {}
            const userMrp = parseFloat(bData.mrp) || 0
            const userDisc = parseFloat(bData.discount) || 0
            const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty
            const rawTotal = totalUnits * userMrp
            const finalPrice = Math.round(rawTotal * (1 - userDisc / 100))
            grandTotal += finalPrice;

            let qtyStr = '';
            if (item.type === 'box') {
                qtyStr = item.qty === 1 ? '1 Box' : `${item.qty} Boxes`;
            } else {
                qtyStr = totalUnits === 1 ? '1 Piece' : `${totalUnits} Pieces`;
            }

            return [i + 1, item.name, item.code, qtyStr, `Rs.${userMrp}`, `Rs.${finalPrice}`];
        })

        customBillItems.forEach((cbi, index) => {
            const userMrp = parseFloat(cbi.mrp) || 0
            const userDisc = parseFloat(cbi.discount) || 0
            let totalUnits = parseInt(cbi.pcsQty) || 0;
            if (parseInt(cbi.boxQty) > 0) totalUnits += parseInt(cbi.boxQty);

            const rawTotal = totalUnits * userMrp
            const finalPrice = Math.round(rawTotal * (1 - userDisc / 100))
            grandTotal += finalPrice;

            let qtyStrs = [];
            if (parseInt(cbi.boxQty) > 0) qtyStrs.push(`${cbi.boxQty} Box`);
            if (parseInt(cbi.pcsQty) > 0) qtyStrs.push(`${cbi.pcsQty} Pcs`);
            let qtyStr = qtyStrs.join(', ') || '0';

            rows.push([orderedItems.length + index + 1, cbi.name, cbi.code || '-', qtyStr, `Rs.${userMrp}`, `Rs.${finalPrice}`])
        })

        rows.push(['', '', '', '', 'GRAND TOTAL:', `Rs.${grandTotal}`])

        doc.autoTable({
            startY: 34,
            head: [['#', 'Product Name', 'Code', 'Qty', 'MRP', 'Final Price']],
            body: rows,
            styles: { fontSize: 10, cellPadding: 4, textColor: [0, 0, 0] },
            headStyles: { fillColor: [220, 220, 225], textColor: [0, 0, 0], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 248, 248] },
            willDrawCell: function (data) {
                if (data.row.index === rows.length - 1) {
                    doc.setFont(undefined, 'bold');
                    doc.setFillColor(235, 235, 235);
                }
            }
        })
        // Sanitize filename
        const safeCustomer = customerName.trim() ? customerName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Order'
        const safeDate = today.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${safeCustomer}_Bill_${safeDate}_${Date.now()}.pdf`

        try {
            setToast('Generating Bill PDF...')
            const pdfBlob = doc.output('blob')

            // 1. Save to History (IndexedDB)
            const extraData = { orders, customBillItems, customerName, billInputs, customItems };
            await savePDFToLocal(filename, pdfBlob, 'Bill', extraData)

            const nowTs = Date.now();
            const totalBoxesBill = orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.boxQty) || 0), 0);
            const totalPiecesBill = orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.pcsQty) || 0), 0);

            if (customerName.trim()) {
                const billRecord = {
                    filename,
                    date: today,
                    timestamp: nowTs,
                    totalItems: orderedItems.length + customBillItems.length,
                    grandTotal,
                    boxes: totalBoxesBill,
                    pieces: totalPiecesBill
                };
                await saveClientBill(customerName, billRecord);
                const updatedClients = await getClients();
                setClientsList(updatedClients);
            }

            // 2. Save detailed bill for daily sales tracking
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const lineItems = [];
            orderedItems.forEach(item => {
                const bData = billInputs[item.id] || {};
                const userMrp = parseFloat(bData.mrp) || 0;
                const userDisc = parseFloat(bData.discount) || 0;
                const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty;
                const rawTotal = totalUnits * userMrp;
                const finalPrice = Math.round(rawTotal * (1 - userDisc / 100));
                lineItems.push({ name: item.name, code: item.code, brand: item.brand || 'Hawkins', type: item.type, qty: item.qty, pieces: totalUnits, mrp: userMrp, finalPrice });
            });
            customBillItems.forEach(cbi => {
                const userMrp = parseFloat(cbi.mrp) || 0;
                const userDisc = parseFloat(cbi.discount) || 0;
                let totalUnits = parseInt(cbi.pcsQty) || 0;
                if (parseInt(cbi.boxQty) > 0) totalUnits += parseInt(cbi.boxQty);
                const rawTotal = totalUnits * userMrp;
                const finalPrice = Math.round(rawTotal * (1 - userDisc / 100));
                lineItems.push({ name: cbi.name, code: cbi.code || '-', brand: cbi.brand || 'Custom', type: 'pcs', qty: totalUnits, pieces: totalUnits, mrp: userMrp, finalPrice });
            });

            const billDetailRecord = {
                billId: `bill-${nowTs}`,
                customerName: customerName.trim() || 'Walk-in',
                date: today,
                dateKey,
                timestamp: nowTs,
                grandTotal,
                totalBoxes: totalBoxesBill,
                totalPieces: totalPiecesBill,
                lineItems
            };
            try { await saveBillDetails(billDetailRecord); } catch(e) { console.error('Bill details save error:', e); }
            try { await saveBillToCloud(billDetailRecord); } catch(e) { console.error('Cloud bill save error:', e); }
            triggerCloudSync();

            // Auto-send bill email
            try {
                await sendBillEmail(billDetailRecord);
                setToast('📧 Bill emailed to you!');
            } catch(emailErr) {
                console.warn('Bill email failed (non-critical):', emailErr);
            }

            if (isNative()) {
                await saveAndOpenPdf(filename, pdfBlob)
                if (!toast) setToast('Opening Bill...')
            } else {
                doc.save(filename)
                if (!toast) setToast('Downloaded PDF')
            }
        } catch (e) {
            console.error(e)
            setToast('Error opening PDF')
        }
    }

    const saveBillWithDiscountPDF = async () => {
        if (orderedItems.length === 0 && customBillItems.length === 0) return
        const doc = new jsPDF()
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        doc.setFontSize(16)
        const title = customerName.trim() ? `Hawkins Bill - ${customerName.trim()} - ${today}` : `Hawkins Bill - ${today}`;
        doc.text(title, 14, 20)
        
        doc.setFontSize(10);
        const totalBoxes = orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.boxQty) || 0), 0);
        const totalPieces = orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.pcsQty) || 0), 0);
        let headerText = `Total Items: ${orderedItems.length + customBillItems.length}`;
        if (totalBoxes > 0) headerText += ` | Total Boxes: ${totalBoxes}`;
        if (totalPieces > 0) headerText += ` | Total Pieces: ${totalPieces}`;
        doc.text(headerText, 14, 28);

        let grandTotal = 0;

        const rows = orderedItems.map((item, i) => {
            const bData = billInputs[item.id] || {}
            const userMrp = parseFloat(bData.mrp) || 0
            const userDisc = parseFloat(bData.discount) || 0
            const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty
            const rawTotal = totalUnits * userMrp
            const finalPrice = Math.round(rawTotal * (1 - userDisc / 100))
            grandTotal += finalPrice;

            let qtyStr = '';
            if (item.type === 'box') {
                qtyStr = item.qty === 1 ? '1 Box' : `${item.qty} Boxes`;
            } else {
                qtyStr = totalUnits === 1 ? '1 Piece' : `${totalUnits} Pieces`;
            }

            return [i + 1, item.name, item.code, qtyStr, `Rs.${userMrp}`, `${userDisc}%`, `Rs.${finalPrice}`];
        })

        customBillItems.forEach((cbi, index) => {
            const userMrp = parseFloat(cbi.mrp) || 0
            const userDisc = parseFloat(cbi.discount) || 0
            let totalUnits = parseInt(cbi.pcsQty) || 0;
            if (parseInt(cbi.boxQty) > 0) totalUnits += parseInt(cbi.boxQty);

            const rawTotal = totalUnits * userMrp
            const finalPrice = Math.round(rawTotal * (1 - userDisc / 100))
            grandTotal += finalPrice;

            let qtyStrs = [];
            if (parseInt(cbi.boxQty) > 0) qtyStrs.push(`${cbi.boxQty} Box`);
            if (parseInt(cbi.pcsQty) > 0) qtyStrs.push(`${cbi.pcsQty} Pcs`);
            let qtyStr = qtyStrs.join(', ') || '0';

            rows.push([orderedItems.length + index + 1, cbi.name, cbi.code || '-', qtyStr, `Rs.${userMrp}`, `${userDisc}%`, `Rs.${finalPrice}`])
        })

        rows.push(['', '', '', '', '', 'GRAND TOTAL:', `Rs.${grandTotal}`])

        doc.autoTable({
            startY: 34,
            head: [['#', 'Product Name', 'Code', 'Qty', 'MRP', 'Discount', 'Final Price']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
            headStyles: { fillColor: [220, 220, 225], textColor: [0, 0, 0], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 248, 248] },
            willDrawCell: function (data) {
                if (data.row.index === rows.length - 1) {
                    doc.setFont(undefined, 'bold');
                    doc.setFillColor(235, 235, 235);
                }
            }
        })
        const safeCustomer = customerName.trim() ? customerName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Order'
        const safeDate = today.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${safeCustomer}_Bill_Disc_${safeDate}_${Date.now()}.pdf`

        try {
            setToast('Generating Discount Bill PDF...')
            const pdfBlob = doc.output('blob')
            const extraData = { orders, customBillItems, customerName, billInputs, customItems };
            await savePDFToLocal(filename, pdfBlob, 'Bill', extraData)

            const nowTs = Date.now();
            const totalBoxesBill = orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.boxQty) || 0), 0);
            const totalPiecesBill = orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0) + customBillItems.reduce((a, i) => a + (parseInt(i.pcsQty) || 0), 0);

            if (customerName.trim()) {
                const billRecord = {
                    filename,
                    date: today,
                    timestamp: nowTs,
                    totalItems: orderedItems.length + customBillItems.length,
                    grandTotal,
                    boxes: totalBoxesBill,
                    pieces: totalPiecesBill
                };
                await saveClientBill(customerName, billRecord);
                const updatedClients = await getClients();
                setClientsList(updatedClients);
            }

            // Save detailed bill for daily sales
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const lineItems = [];
            orderedItems.forEach(item => {
                const bData = billInputs[item.id] || {};
                const userMrp = parseFloat(bData.mrp) || 0;
                const userDisc = parseFloat(bData.discount) || 0;
                const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty;
                const rawTotal = totalUnits * userMrp;
                const finalPrice = Math.round(rawTotal * (1 - userDisc / 100));
                lineItems.push({ name: item.name, code: item.code, brand: item.brand || 'Hawkins', type: item.type, qty: item.qty, pieces: totalUnits, mrp: userMrp, finalPrice });
            });
            customBillItems.forEach(cbi => {
                const userMrp = parseFloat(cbi.mrp) || 0;
                const userDisc = parseFloat(cbi.discount) || 0;
                let totalUnits = parseInt(cbi.pcsQty) || 0;
                if (parseInt(cbi.boxQty) > 0) totalUnits += parseInt(cbi.boxQty);
                const rawTotal = totalUnits * userMrp;
                const finalPrice = Math.round(rawTotal * (1 - userDisc / 100));
                lineItems.push({ name: cbi.name, code: cbi.code || '-', brand: cbi.brand || 'Custom', type: 'pcs', qty: totalUnits, pieces: totalUnits, mrp: userMrp, finalPrice });
            });

            const billDetailRecord = {
                billId: `bill-disc-${nowTs}`,
                customerName: customerName.trim() || 'Walk-in',
                date: today, dateKey, timestamp: nowTs,
                grandTotal, totalBoxes: totalBoxesBill, totalPieces: totalPiecesBill,
                lineItems
            };
            try { await saveBillDetails(billDetailRecord); } catch(e) { console.error(e); }
            try { await saveBillToCloud(billDetailRecord); } catch(e) { console.error(e); }
            triggerCloudSync();

            // Auto-send bill email
            try {
                await sendBillEmail(billDetailRecord);
            } catch(emailErr) {
                console.warn('Bill email failed (non-critical):', emailErr);
            }

            if (isNative()) {
                await saveAndOpenPdf(filename, pdfBlob)
                setToast('📧 Bill emailed + Opening...')
            } else {
                doc.save(filename)
                setToast('📧 Bill PDF downloaded + Emailed!')
            }
        } catch (e) {
            console.error(e)
            setToast('Error opening PDF')
        }
    }

    const getItemMrp = (item) => mrpOverrides[item.id] !== undefined ? mrpOverrides[item.id] : item.mrp;

    const renderItem = (item) => {
        const o = orders[item.id]
        const boxQty = o && o.type === 'box' ? o.qty : 0
        const pcsQty = o && o.type === 'pcs' ? o.qty : 0
        const isSelected = !!o
        const displayMrp = getItemMrp(item);

        return (
            <div key={item.id} className={`product-item${isSelected ? ' selected' : ''}`}>
                <div className="product-row1">
                    <span className="product-serial">#{item.id}</span>
                    <span className="product-name">{item.name}</span>
                    <span className="product-code" onClick={() => setImgModal(item)}>{item.code}</span>
                </div>
                <div className="product-row2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {mrpEditId === item.id ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <input type="number" value={mrpEditVal} onChange={e => setMrpEditVal(e.target.value)} style={{ width: 60, padding: '2px 6px', border: '1px solid var(--blue)', borderRadius: 4, fontSize: '0.85rem' }} autoFocus onKeyDown={e => { if (e.key === 'Enter') handleMrpEdit(item.id, mrpEditVal); }} />
                                <button onClick={() => handleMrpEdit(item.id, mrpEditVal)} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✓</button>
                                <button onClick={() => setMrpEditId(null)} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
                            </div>
                        ) : (
                            <>
                                <span className="product-mrp">₹{displayMrp}</span>
                                <button onClick={() => { setMrpEditId(item.id); setMrpEditVal(String(displayMrp)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem' }} title="Edit MRP">✏️</button>
                            </>
                        )}
                        <span className="product-case"> · {item.casePack}/case</span>
                    </div>
                    <div className="qty-controls">
                        <div className={`qty-group${boxQty > 0 ? ' active-box' : ''}`}>
                            <span className="qty-label">Box</span>
                            <button className="qty-btn minus" onClick={() => updateQty(item.id, 'box', -1)}>−</button>
                            <span className={`qty-val${boxQty > 0 ? ' has-val-box' : ''}`}>{boxQty}</span>
                            <button className="qty-btn plus" onClick={() => updateQty(item.id, 'box', 1)}>+</button>
                        </div>
                        <div className={`qty-group${pcsQty > 0 ? ' active-pcs' : ''}`}>
                            <span className="qty-label">Pcs</span>
                            <button className="qty-btn minus" onClick={() => updateQty(item.id, 'pcs', -1)}>−</button>
                            <span className={`qty-val${pcsQty > 0 ? ' has-val-pcs' : ''}`}>{pcsQty}</span>
                            <button className="qty-btn plus" onClick={() => updateQty(item.id, 'pcs', 1)}>+</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

    return (
        <>
            <header className="header">
                <div className="header-top">
                    <h1><span>Hawkins</span> Order Manager</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={`sync-indicator ${syncStatus}`}>
                            <span className="sync-dot"></span>
                            {syncStatus === 'synced' ? '✅ Synced' : syncStatus === 'syncing' ? '🔄 Syncing...' : syncStatus === 'pending' ? '⏳ Pending' : syncStatus === 'error' ? '⚠️ Error' : '📴 Offline'}
                        </div>
                        {totalCount > 0 && <span className="badge">{totalCount}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6, margin: '14px 0 8px', overflowX: 'auto', paddingBottom: 4 }}>
                    {[
                        { name: 'Price List', filename: 'Pricelist .pdf' },
                        { name: 'Cookware', filename: 'COOKWARE IMAGES.pdf' },
                        { name: 'Cookers', filename: 'COOKERS IMAGES .pdf' }
                    ].map(p => (
                        <button key={p.name} style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue)', borderRadius: 12, whiteSpace: 'nowrap' }} onClick={() => openRemotePdf(p.filename)}>📄 {p.name}</button>
                    ))}
                    {customPdfs.map(p => (
                        <button key={p.name} style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue)', borderRadius: 12, whiteSpace: 'nowrap', position: 'relative' }} onClick={() => setActivePdf({ name: p.name, src: p.src })}>
                            📄 {p.name}
                            <span onClick={(e) => { e.stopPropagation(); handleDeleteCustomPdf(p.name); }} style={{ marginLeft: 6, color: '#d32f2f', fontWeight: 900, cursor: 'pointer' }}>×</span>
                        </button>
                    ))}
                    <button style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--green-bg)', color: 'var(--green)', border: '1px dashed var(--green)', borderRadius: 12, whiteSpace: 'nowrap' }} onClick={() => setPdfModal(true)}>+ Add PDF</button>
                </div>

                <div className="tabs">
                    <button className={`tab-btn${tab === 'catalog' ? ' active' : ''}`} onClick={() => setTab('catalog')}>
                        📦 Catalog
                    </button>
                    <button className={`tab-btn${tab === 'order' ? ' active' : ''}`} onClick={() => setTab('order')}>
                        📋 Order {totalCount > 0 && `(${totalCount})`}
                    </button>
                    <button className={`tab-btn${tab === 'bill' ? ' active' : ''}`} onClick={() => setTab('bill')}>
                        💸 Bill
                    </button>
                    <button className={`tab-btn${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
                        🕒 History
                    </button>
                    <button className={`tab-btn${tab === 'clients' ? ' active' : ''}`} onClick={() => { setActiveClient(null); setTab('clients'); }}>
                        👥 Clients
                    </button>
                    <button className={`tab-btn${tab === 'sales' ? ' active' : ''}`} onClick={() => setTab('sales')}>
                        📊 Sales
                    </button>
                </div>

                {tab === 'catalog' && (
                    <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {allBrands.map(b => (
                                <button key={b} onClick={() => setActiveBrand(b)} style={{
                                    padding: '6px 14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer',
                                    background: activeBrand === b ? 'var(--blue)' : '#f0f0f0', color: activeBrand === b ? '#fff' : '#333', border: 'none'
                                }}>{b}</button>
                            ))}
                        </div>
                        <div className="search-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input className="search-input" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button style={{ marginTop: 10, padding: '12px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 'var(--rs)', width: '100%', fontWeight: 700, cursor: 'pointer' }} onClick={() => setAddModal(true)}>
                            + Add Custom Product
                        </button>
                    </div>
                )}
            </header>

            <div className={`layout-wrapper`}>
                <div className="page-content">
                    {tab === 'catalog' && (
                        <div>
                            {filteredSections.map((section, si) => {
                                const sKey = `s-${si}`
                                const isOpen = openSections[sKey] !== false
                                const itemCount = section.items.length + section.subsections.reduce((a, s) => a + s.items.length, 0)
                                return (
                                    <div className="section-group" key={sKey}>
                                        <div className="section-header" onClick={() => toggleSection(sKey)}>
                                            <span className="section-title">{section.name}</span>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span className="section-count">{itemCount} items</span>
                                                <span className={`section-chevron${isOpen ? ' open' : ''}`}>▼</span>
                                            </div>
                                        </div>
                                        {isOpen && (
                                            <div className="items-list">
                                                {section.items.map(renderItem)}
                                                {section.subsections.map((sub, subi) => (
                                                    <div key={`sub-${subi}`}>
                                                        <div className="sub-header">{sub.name}</div>
                                                        {sub.items.map(renderItem)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {tab === 'order' && (
                        <div>
                            <div className="order-header-bar">
                                <div className="order-date">Order — <span>{today}</span></div>
                                <div className="order-stats">
                                    <span className="order-stat">Items: <strong>{orderedItems.length}</strong></span>
                                    <span className="order-stat">
                                        Boxes: <strong>{orderedItems.filter(i => i.type === 'box').reduce((a, i) => a + i.qty, 0)}</strong>
                                    </span>
                                    <span className="order-stat">
                                        Pieces: <strong>{orderedItems.filter(i => i.type === 'pcs').reduce((a, i) => a + i.qty, 0)}</strong>
                                    </span>
                                </div>
                            </div>

                            {orderedItems.length === 0 ? (
                                <div className="order-empty">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    <p>No items selected yet.<br />Go to Catalog and add items!</p>
                                </div>
                            ) : (
                                <>
                                    {orderedItems.map((item, i) => (
                                        <div className="order-item" key={item.id} style={{ flexWrap: 'wrap' }}>
                                            <span className="order-item-no">{i + 1}</span>
                                            <div className="order-item-info" style={{ flex: 1 }}>
                                                <div className="order-item-name">{item.name}</div>
                                                <div className="order-item-code">{item.code}</div>
                                            </div>
                                            <button className="order-item-remove" onClick={() => removeItem(item.id)} title="Remove item">
                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                                            </button>
                                            <div style={{ width: '100%', marginTop: 8, paddingLeft: 30 }}>
                                                <div className="qty-controls">
                                                    <div className={`qty-group${item.type === 'box' ? ' active-box' : ''}`}>
                                                        <span className="qty-label">Box</span>
                                                        <button className="qty-btn minus" onClick={() => updateQty(item.id, 'box', -1)}>−</button>
                                                        <span className={`qty-val${item.type === 'box' && item.qty > 0 ? ' has-val-box' : ''}`}>{item.type === 'box' ? item.qty : 0}</span>
                                                        <button className="qty-btn plus" onClick={() => updateQty(item.id, 'box', 1)}>+</button>
                                                    </div>
                                                    <div className={`qty-group${item.type === 'pcs' ? ' active-pcs' : ''}`}>
                                                        <span className="qty-label">Pcs</span>
                                                        <button className="qty-btn minus" onClick={() => updateQty(item.id, 'pcs', -1)}>−</button>
                                                        <span className={`qty-val${item.type === 'pcs' && item.qty > 0 ? ' has-val-pcs' : ''}`}>{item.type === 'pcs' ? item.qty : 0}</span>
                                                        <button className="qty-btn plus" onClick={() => updateQty(item.id, 'pcs', 1)}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button className="pdf-btn" style={{ flex: 1 }} onClick={savePDF}>
                                            📄 View Order PDF
                                        </button>
                                        <button className="pdf-btn email-btn" style={{ flex: 1 }} onClick={async () => {
                                            if (orderedItems.length === 0) return showToast('No items to email');
                                            setEmailSending(true);
                                            try {
                                                const now = new Date();
                                                const todayStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                                                const lineItems = orderedItems.map(item => ({ name: item.name, code: item.code, brand: item.brand || 'Hawkins', type: item.type, qty: item.qty, pieces: item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty }));
                                                const totalBoxes = orderedItems.filter(i => i.type === 'box').reduce((a,i) => a + i.qty, 0);
                                                const totalPieces = orderedItems.filter(i => i.type === 'pcs').reduce((a,i) => a + i.qty, 0);
                                                await sendOrderEmail({ date: todayStr, dateKey, totalBoxes, totalPieces, lineItems });
                                                showToast('📧 Order emailed!');
                                            } catch(e) { showToast('❌ Email failed. Check connection.'); }
                                            setEmailSending(false);
                                        }} disabled={emailSending}>
                                            {emailSending ? '⏳ Sending...' : '📧 Send as Email'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {tab === 'bill' && (
                        <div>
                            <div className="order-header-bar" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="order-date">Bill Generator — <span>{today}</span></div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="search-input"
                                        style={{ width: '100%', padding: '10px 14px' }}
                                        placeholder="Customer Name (e.g. Mr. Sharma)"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        list="customer-suggestions"
                                    />
                                    <datalist id="customer-suggestions">
                                        {clientsList.map((c, i) => <option key={i} value={c.displayName || c.name} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div style={{ background: '#f8f8f8', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>+ Add Custom Bill Item</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '8px' }}>
                                    <input className="search-input" placeholder="Name" value={customBillInputs.name} onChange={e => setCustomBillInputs({ ...customBillInputs, name: e.target.value })} />
                                    <input className="search-input" placeholder="Code" value={customBillInputs.code} onChange={e => setCustomBillInputs({ ...customBillInputs, code: e.target.value })} />
                                    <input className="search-input" type="number" placeholder="Boxes" value={customBillInputs.boxQty} onChange={e => setCustomBillInputs({ ...customBillInputs, boxQty: e.target.value })} />
                                    <input className="search-input" type="number" placeholder="Pieces" value={customBillInputs.pcsQty} onChange={e => setCustomBillInputs({ ...customBillInputs, pcsQty: e.target.value })} />
                                    <input className="search-input" type="number" placeholder="MRP (₹)" value={customBillInputs.mrp} onChange={e => setCustomBillInputs({ ...customBillInputs, mrp: e.target.value })} />
                                    <input className="search-input" type="number" placeholder="Discount %" value={customBillInputs.discount} onChange={e => setCustomBillInputs({ ...customBillInputs, discount: e.target.value })} />
                                </div>
                                <button style={{ width: '100%', padding: '10px', marginTop: '10px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold' }} onClick={() => {
                                    if (!customBillInputs.name) return showToast('Name required');
                                    setCustomBillItems([...customBillItems, { ...customBillInputs, id: 'cbi-' + Date.now() }]);
                                    setCustomBillInputs({ name: '', code: '', boxQty: '', pcsQty: '', mrp: '', discount: '' });
                                }}>Add Item</button>
                            </div>

                            {orderedItems.length === 0 && customBillItems.length === 0 ? (
                                <div className="order-empty">
                                    <p>No items in order to bill.</p>
                                </div>
                            ) : (
                                <div className="bill-container">
                                    {orderedItems.map((item, i) => {
                                        const bData = billInputs[item.id] || { mrp: '', discount: '' }
                                        const userMrp = parseFloat(bData.mrp) || 0
                                        const userDisc = parseFloat(bData.discount) || 0
                                        const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty
                                        const rawTotal = totalUnits * userMrp
                                        const finalPrice = Math.round(rawTotal * (1 - userDisc / 100))

                                        return (
                                            <div className="bill-item" key={item.id}>
                                                <div className="bill-item-header">
                                                    <span className="bill-item-no">{i + 1}</span>
                                                    <div className="bill-item-info">
                                                        <div className="bill-item-name">{item.name}</div>
                                                        <div className="bill-item-meta">
                                                            <span className="bill-item-code">{item.code}</span>
                                                            <span className="bill-item-qty">{item.qty} {item.type === 'box' ? 'Box' : 'Pcs'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bill-item-inputs">
                                                    <div className="bill-input-group">
                                                        <label>MRP (₹)</label>
                                                        <input type="number" placeholder="0" value={bData.mrp} onChange={e => handleBillChange(item.id, 'mrp', e.target.value)} />
                                                    </div>
                                                    <div className="bill-input-group">
                                                        <label>Discount %</label>
                                                        <input type="number" placeholder="0" value={bData.discount} onChange={e => handleBillChange(item.id, 'discount', e.target.value)} />
                                                    </div>
                                                    <div className="bill-item-total">
                                                        <label>Final</label>
                                                        <div className="bill-val">₹{finalPrice}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="bill-grand-total">
                                        <span>Grand Total</span>
                                        <span>₹{orderedItems.reduce((acc, item) => {
                                            const bData = billInputs[item.id] || {}
                                            const totalUnits = item.type === 'box' ? (item.qty * (item.casePack || 1)) : item.qty
                                            const r = totalUnits * (parseFloat(bData.mrp) || 0)
                                            return acc + Math.round(r * (1 - (parseFloat(bData.discount) || 0) / 100))
                                        }, 0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button className="pdf-btn" style={{ flex: 1 }} onClick={saveBillPDF}>
                                            📄 View Bill PDF
                                        </button>
                                        <button className="pdf-btn" style={{ flex: 1, background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' }} onClick={saveBillWithDiscountPDF}>
                                            📄 Bill (Discount)
                                        </button>
                                        <button className="pdf-btn email-btn" style={{ flex: 1 }} onClick={async () => {
                                            if (orderedItems.length === 0 && customBillItems.length === 0) return showToast('No items to email');
                                            setEmailSending(true);
                                            try {
                                                const now = new Date();
                                                const todayStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                                                let gt = 0;
                                                const lineItems = [
                                                    ...orderedItems.map(item => { const bd = billInputs[item.id]||{}; const u = item.type==='box'?(item.qty*(item.casePack||1)):item.qty; const fp = Math.round(u*(parseFloat(bd.mrp)||0)*(1-(parseFloat(bd.discount)||0)/100)); gt+=fp; return { name: item.name, code: item.code, brand: item.brand||'Hawkins', type: item.type, qty: item.qty, pieces: u, mrp: parseFloat(bd.mrp)||0, finalPrice: fp }; }),
                                                    ...customBillItems.map(cbi => { const u = (parseInt(cbi.pcsQty)||0)+(parseInt(cbi.boxQty)||0); const fp = Math.round(u*(parseFloat(cbi.mrp)||0)*(1-(parseFloat(cbi.discount)||0)/100)); gt+=fp; return { name: cbi.name, code: cbi.code||'-', brand: 'Custom', type: 'pcs', qty: u, pieces: u, mrp: parseFloat(cbi.mrp)||0, finalPrice: fp }; })
                                                ];
                                                await sendBillEmail({ customerName: customerName||'Walk-in', date: todayStr, dateKey, grandTotal: gt, totalBoxes: 0, totalPieces: 0, lineItems });
                                                showToast('📧 Bill emailed!');
                                            } catch(e) { showToast('❌ Email failed. Check connection.'); }
                                            setEmailSending(false);
                                        }} disabled={emailSending}>
                                            {emailSending ? '⏳ Sending...' : '📧 Send as Email'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'history' && (
                        <div className="order-summary" style={{ padding: '16px 0' }}>
                            <h2 style={{ padding: '0 16px', marginBottom: 12 }}>PDF History</h2>
                            <div style={{ padding: '0 16px', marginBottom: '8px' }}>
                                <input className="search-input" style={{ width: '100%', padding: '10px 14px' }} placeholder="Search History by Customer Name / Filename..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                            </div>
                            <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                                <label style={{ display: 'block', width: '100%', padding: '10px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                                    + Import Old PDF to History
                                    <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleImportHistoryPdf} />
                                </label>
                            </div>
                            {isLoadingHistory ? (
                                <p style={{ padding: '16px' }}>Loading history from Device...</p>
                            ) : historyItems.length === 0 ? (
                                <p style={{ padding: '16px', color: '#666' }}>No PDFs found in Offline Storage.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
                                    {historyItems.filter(f => {
                                        const q = historySearch.trim().toLowerCase();
                                        if (!q) return true;
                                        const words = q.split(/\s+/);
                                        const target = f.name.toLowerCase();
                                        return words.every(w => target.includes(w));
                                    }).map((file, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f8f8', padding: '12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{file.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(file.created_at).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button onClick={() => setActivePdf({ name: file.name, src: file.data })} style={{ background: 'var(--blue-bg)', color: 'var(--blue)', padding: '6px 10px', border: '1px solid var(--blue)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View</button>
                                                <button onClick={async () => {
                                                    setEmailSending(true);
                                                    try {
                                                        await sendHistoryPdfEmail(file);
                                                        showToast('📧 Email sent!');
                                                    } catch(e) { showToast('❌ Email failed'); }
                                                    setEmailSending(false);
                                                }} style={{ background: '#e3f2fd', color: '#1565c0', padding: '6px 10px', border: '1px solid #90caf9', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }} disabled={emailSending}>📧 Email</button>
                                                {file.extraData && file.type === 'Local' ? (
                                                    <button onClick={() => {
                                                        const d = file.extraData;
                                                        if (d.orders) setOrders(d.orders);
                                                        if (d.customItems) setCustomItems(d.customItems);
                                                        // If it's a Bill, also restore bill-specific state
                                                        if (d.customBillItems) setCustomBillItems(d.customBillItems);
                                                        if (d.customerName !== undefined) setCustomerName(d.customerName || '');
                                                        if (d.billInputs) setBillInputs(d.billInputs);
                                                        // Switch to the right tab
                                                        const isBill = file.name.includes('Bill');
                                                        setTab(isBill ? 'bill' : 'order');
                                                        showToast(isBill ? 'Loaded bill for editing!' : 'Loaded order for editing!');
                                                    }} style={{ background: '#fff3e0', color: '#e65100', padding: '6px 10px', border: '1px solid #ffcc80', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>✏️ Edit</button>
                                                ) : file.type === 'Local' && (
                                                    <button onClick={async () => {
                                                        const newName = window.prompt("Rename this PDF:", file.name);
                                                        if (newName && newName.trim() && newName !== file.name) {
                                                            let finalName = newName.trim();
                                                            if (!finalName.toLowerCase().endsWith('.pdf')) finalName += '.pdf';
                                                            try {
                                                                await renameLocalPDF(file.name, finalName);
                                                                showToast('Renamed successfully!');
                                                                loadHistory();
                                                            } catch(err) {
                                                                showToast('Failed to rename. Name might already exist.');
                                                            }
                                                        }
                                                    }} style={{ background: '#fff3e0', color: '#e65100', padding: '6px 10px', border: '1px solid #ffcc80', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>✏️ Rename</button>
                                                )}
                                                {isNative() && (
                                                    <button onClick={async () => {
                                                        try {
                                                            showToast('Saving to Downloads...')
                                                            // Convert base64 data URL back to blob
                                                            const resp = await fetch(file.data)
                                                            const blob = await resp.blob()
                                                            await saveAndOpenPdf(file.name, blob)
                                                            showToast('Opened in your PDF viewer!')
                                                        } catch (e) {
                                                            showToast('Failed to download')
                                                        }
                                                    }} style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', padding: '6px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>📥 Save</button>
                                                )}
                                                <button style={{ background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '6px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => deleteHistoryItem(file.name)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'clients' && (
                        <div className="clients-container">
                            {!activeClient ? (
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h2 style={{ margin: 0 }}>Clients Ledger</h2>
                                        <button onClick={() => setClientModal(true)} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Client</button>
                                    </div>
                                    
                                    {clientModal && (
                                        <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }}>
                                            <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Create Manual Client</h3>
                                            <input className="search-input" style={{ width: '100%', marginBottom: 12, padding: '10px' }} placeholder="Customer Name (e.g. Mr. Khurana)" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={handleAddClient} style={{ flex: 1, background: 'var(--green)', color: '#fff', border: 'none', padding: '8px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Save Client</button>
                                                <button onClick={() => setClientModal(false)} style={{ background: '#ddd', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    {clientsList.length === 0 ? (
                                        <p style={{ color: '#666' }}>No clients yet. Generate a bill with a customer name to start.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {clientsList.slice().sort((a,b) => {
                                                const aTotal = a.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
                                                const aRec = (a.receipts && a.receipts.length > 0) ? a.receipts.reduce((sum, r) => sum + r.amount, 0) : (parseFloat(a.amountReceived) || 0);
                                                const aBal = aTotal - aRec;
                                                const bTotal = b.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
                                                const bRec = (b.receipts && b.receipts.length > 0) ? b.receipts.reduce((sum, r) => sum + r.amount, 0) : (parseFloat(b.amountReceived) || 0);
                                                const bBal = bTotal - bRec;
                                                return bBal - aBal;
                                            }).map(client => {
                                                const totalBilled = client.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
                                                const received = (client.receipts && client.receipts.length > 0) ? client.receipts.reduce((sum, r) => sum + r.amount, 0) : (parseFloat(client.amountReceived) || 0);
                                                const balance = totalBilled - received;
                                                return (
                                                    <div key={client.name} className="client-card" onClick={() => setActiveClient(client)}>
                                                        <div className="client-card-left">
                                                            <div className="client-name">{client.displayName || client.name}</div>
                                                            <div className="client-bills-count">{client.bills.length} bills</div>
                                                        </div>
                                                        <div className="client-card-right">
                                                            <div className={`client-balance ${balance > 0 ? 'red' : balance < 0 ? 'green' : 'neutral'}`}>
                                                                ₹{balance}
                                                            </div>
                                                            <div className="client-chevron">›</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="client-detail">
                                    <div className="client-detail-header" style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                                        <button onClick={() => setActiveClient(null)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: 10 }}>← Back</button>
                                        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>{activeClient.displayName || activeClient.name}</h2>
                                        
                                        {(() => {
                                            const totalBilled = activeClient.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
                                            const received = (activeClient.receipts && activeClient.receipts.length > 0) ? activeClient.receipts.reduce((sum, r) => sum + r.amount, 0) : (parseFloat(activeClient.amountReceived) || 0);
                                            const balance = totalBilled - received;
                                            
                                            return (
                                                <div className="client-stats-grid">
                                                    <div className="stat-box">
                                                        <div className="stat-label">Total Billed</div>
                                                        <div className="stat-val">₹{totalBilled}</div>
                                                    </div>
                                                    <div className="stat-box">
                                                        <div className="stat-label">Received</div>
                                                        <div className="stat-val" style={{ color: 'var(--green)' }}>₹{received}</div>
                                                    </div>
                                                    <div className="stat-box" style={{ background: balance > 0 ? '#ffebee' : balance < 0 ? '#e8f5e9' : '#f5f5f5', border: `1px solid ${balance > 0 ? '#ffcdd2' : balance < 0 ? '#c8e6c9' : '#e0e0e0'}` }}>
                                                        <div className="stat-label" style={{ color: balance > 0 ? '#d32f2f' : balance < 0 ? '#2e7d32' : '#666' }}>Balance</div>
                                                        <div className="stat-val" style={{ color: balance > 0 ? '#d32f2f' : balance < 0 ? '#2e7d32' : '#333' }}>₹{balance}</div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                            <button onClick={() => {
                                                const now = new Date();
                                                setEntryForm({ amount: '', date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0,5), reason: '' });
                                                setManualEntry('bill');
                                            }} style={{ flex: 1, padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>+ Add Manual Bill</button>
                                            
                                            <button onClick={() => {
                                                const now = new Date();
                                                setEntryForm({ amount: '', date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0,5), reason: '' });
                                                setManualEntry('receipt');
                                            }} style={{ flex: 1, padding: '10px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>+ Add Receipt</button>
                                        </div>

                                        {manualEntry && (() => {
                                            const totalBilled = activeClient.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
                                            const received = (activeClient.receipts && activeClient.receipts.length > 0) ? activeClient.receipts.reduce((sum, r) => sum + r.amount, 0) : (parseFloat(activeClient.amountReceived) || 0);
                                            const balance = totalBilled - received;
                                            const amountNum = parseFloat(entryForm.amount) || 0;
                                            const newBalance = manualEntry === 'bill' ? (balance + amountNum) : (balance - amountNum);

                                            return (
                                                <div style={{ marginTop: 16, background: '#f8f8f8', padding: '16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                                    <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>{manualEntry === 'bill' ? 'Add Manual Bill' : 'Add Receipt'}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                                                            <span>Previous Balance:</span>
                                                            <span style={{ fontWeight: 'bold' }}>₹{balance}</span>
                                                        </div>
                                                        <input type="number" placeholder="Amount (₹)" value={entryForm.amount} onChange={e => setEntryForm({...entryForm, amount: e.target.value})} className="search-input" style={{ width: '100%', padding: '10px' }} autoFocus />
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <input type="date" value={entryForm.date} onChange={e => setEntryForm({...entryForm, date: e.target.value})} className="search-input" style={{ flex: 1, padding: '10px' }} />
                                                            <input type="time" value={entryForm.time} onChange={e => setEntryForm({...entryForm, time: e.target.value})} className="search-input" style={{ flex: 1, padding: '10px' }} />
                                                        </div>
                                                        <input type="text" placeholder="Remarks / Reason (Optional)" value={entryForm.reason} onChange={e => setEntryForm({...entryForm, reason: e.target.value})} className="search-input" style={{ width: '100%', padding: '10px' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', background: '#e0e0e0', padding: 8, borderRadius: 4 }}>
                                                            <span>New Balance:</span>
                                                            <span style={{ fontWeight: 'bold', color: newBalance > 0 ? '#d32f2f' : newBalance < 0 ? '#2e7d32' : '#333' }}>₹{newBalance}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                                            <button onClick={async () => {
                                                                if (amountNum <= 0) return showToast('Enter valid amount');
                                                                try {
                                                                    const dateObj = new Date(`${entryForm.date}T${entryForm.time || '00:00'}`);
                                                                    const displayDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                    const ts = dateObj.getTime();

                                                                    if (manualEntry === 'bill') {
                                                                        await addManualBill(activeClient.name, amountNum, displayDate, ts, entryForm.reason);
                                                                    } else {
                                                                        await updateClientPayment(activeClient.name, amountNum, displayDate, ts, entryForm.reason);
                                                                    }
                                                                    setManualEntry(null);
                                                                    const updated = await getClients();
                                                                    setClientsList(updated);
                                                                    setActiveClient(updated.find(c => c.name === activeClient.name));
                                                                    showToast(`${manualEntry === 'bill' ? 'Bill' : 'Receipt'} added!`);
                                                                    triggerCloudSync();
                                                                } catch(e) { console.error(e); showToast('Error saving entry'); }
                                                            }} style={{ flex: 1, background: manualEntry === 'bill' ? 'var(--accent)' : 'var(--green)', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 'bold' }}>Save</button>
                                                            <button onClick={() => setManualEntry(null)} style={{ background: '#ddd', color: '#333', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 'bold' }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                                            {['All', 'Bills', 'Receipts'].map(filter => (
                                                <button key={filter} onClick={() => setActiveClientFilter(filter)} style={{
                                                    padding: '6px 14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer',
                                                    background: activeClientFilter === filter ? 'var(--blue)' : '#f0f0f0', color: activeClientFilter === filter ? '#fff' : '#333', border: 'none'
                                                }}>{filter}</button>
                                            ))}
                                        </div>
                                        
                                        {(() => {
                                            let timeline = [];
                                            if (activeClientFilter === 'All' || activeClientFilter === 'Bills') {
                                                timeline.push(...activeClient.bills.map(b => ({ ...b, _type: 'bill' })));
                                            }
                                            if (activeClientFilter === 'All' || activeClientFilter === 'Receipts') {
                                                const receipts = activeClient.receipts || [];
                                                timeline.push(...receipts.map(r => ({ ...r, _type: 'receipt' })));
                                            }
                                            timeline.sort((a,b) => b.timestamp - a.timestamp); // newest first
                                            
                                            if (timeline.length === 0) {
                                                return <p style={{ color: '#666' }}>No records found.</p>;
                                            }

                                            return timeline.map((entry, i) => (
                                                <div key={i} className="client-bill-card" style={{ borderLeft: `4px solid ${entry._type === 'bill' ? 'var(--accent)' : 'var(--green)'}` }}>
                                                    <div className="client-bill-main">
                                                        <div className="client-bill-date">
                                                            <span>📅 {entry.date}</span>
                                                            <span style={{ color: '#888', fontSize: '0.75rem' }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="client-bill-total" style={{ color: entry._type === 'bill' ? 'var(--accent)' : 'var(--green)' }}>
                                                            {entry._type === 'bill' ? `₹${entry.grandTotal} (Bill)` : `₹${entry.amount} (Receipt)`}
                                                        </div>
                                                    </div>
                                                    {entry.remarks && (
                                                        <div style={{ fontSize: '0.8rem', color: '#555', marginTop: 4, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>
                                                            💬 {entry.remarks}
                                                        </div>
                                                    )}
                                                    {entry._type === 'bill' && (
                                                        <div className="client-bill-meta">
                                                            <span>{entry.totalItems} Items</span>
                                                            <span>•</span>
                                                            <span>{entry.boxes} Boxes, {entry.pieces} Pcs</span>
                                                        </div>
                                                    )}
                                                    <div className="client-bill-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                        {entry._type === 'bill' && entry.filename !== 'Manual Record' && entry.filename !== 'Manual Opening Balance' && (
                                                            <button onClick={() => {
                                                                const matchingHistory = historyItems.find(h => h.name === entry.filename);
                                                                if (matchingHistory && matchingHistory.data) {
                                                                    setActivePdf({ name: matchingHistory.name, src: matchingHistory.data });
                                                                } else {
                                                                    showToast('PDF not found in local history.');
                                                                }
                                                            }} className="client-action-btn view-btn">View PDF</button>
                                                        )}
                                                        <button onClick={() => {
                                                            const d = new Date(entry.timestamp);
                                                            const amt = entry._type === 'bill' ? entry.grandTotal : entry.amount;
                                                            // to local YYYY-MM-DD string
                                                            const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0');
                                                            setEditEntry({ type: entry._type, oldTimestamp: entry.timestamp });
                                                            setEditForm({ amount: amt, date: `${yyyy}-${mm}-${dd}`, time: d.toTimeString().slice(0,5), reason: entry.remarks || '' });
                                                        }} className="client-action-btn" style={{ background: '#fff9c4', color: '#f57f17', border: '1px solid #fff59d' }}>✎ Edit</button>
                                                        
                                                        <button onClick={async () => {
                                                            const confirmDel = window.confirm(`Are you sure you want to delete this ${entry._type}?`);
                                                            if (confirmDel) {
                                                                try {
                                                                    await deleteClientRecord(activeClient.name, entry._type, entry.timestamp);
                                                                    const updated = await getClients();
                                                                    setClientsList(updated);
                                                                    setActiveClient(updated.find(c => c.name === activeClient.name));
                                                                    showToast('Record Deleted!');
                                                                    triggerCloudSync();
                                                                } catch(e) { console.error(e); }
                                                            }
                                                        }} className="client-action-btn" style={{ background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2' }}>🗑 Delete</button>
                                                    </div>
                                                </div>
                                            ));
                                        })()}

                                        {editEntry && (
                                            <div style={{ marginTop: 16, background: '#fff9c4', padding: '16px', borderRadius: 8, border: '1px solid #fff59d' }}>
                                                <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Edit {editEntry.type === 'bill' ? 'Bill' : 'Receipt'}</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    <input type="number" placeholder="Amount (₹)" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="search-input" style={{ width: '100%', padding: '10px' }} autoFocus />
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="search-input" style={{ flex: 1, padding: '10px' }} />
                                                        <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="search-input" style={{ flex: 1, padding: '10px' }} />
                                                    </div>
                                                    <input type="text" placeholder="Remarks / Reason (Optional)" value={editForm.reason} onChange={e => setEditForm({...editForm, reason: e.target.value})} className="search-input" style={{ width: '100%', padding: '10px' }} />
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                                        <button onClick={async () => {
                                                            const amountNum = parseFloat(editForm.amount) || 0;
                                                            if (amountNum <= 0) return showToast('Enter valid amount');
                                                            try {
                                                                const dateObj = new Date(`${editForm.date}T${editForm.time || '00:00'}`);
                                                                const displayDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                const ts = dateObj.getTime();
                                                                
                                                                await editClientRecord(activeClient.name, editEntry.type, editEntry.oldTimestamp, {
                                                                    amount: amountNum, dateStr: displayDate, newTimestamp: ts, remarks: editForm.reason
                                                                });
                                                                setEditEntry(null);
                                                                const updated = await getClients();
                                                                setClientsList(updated);
                                                                setActiveClient(updated.find(c => c.name === activeClient.name));
                                                                showToast('Record Updated!');
                                                                triggerCloudSync();
                                                            } catch(e) { console.error(e); showToast('Error updating entry'); }
                                                        }} style={{ flex: 1, background: '#f57f17', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 'bold' }}>Update</button>
                                                        <button onClick={() => setEditEntry(null)} style={{ background: '#ddd', color: '#333', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 'bold' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'sales' && (
                        <div className="sales-container">
                            <div className="sales-header">
                                <h2>📊 Daily Sales</h2>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="sales-export-btn" style={{ background: 'var(--green)', color: '#fff', border: 'none' }} onClick={() => {
                                        const now = new Date();
                                        const todayStr = now.toISOString().split('T')[0];
                                        setManualSaleForm({ date: todayStr, pieces: '', amount: '', notes: '' });
                                        setManualSaleModal(true);
                                    }}>+ Add Sales</button>
                                    <button className="sales-export-btn" onClick={async () => {
                                    try {
                                        showToast('Generating report...');
                                        const doc = new jsPDF();
                                        const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                        doc.setFontSize(16);
                                        doc.text(`Daily Sales Report - ${todayStr}`, 14, 20);
                                        let y = 32;
                                        dailySalesData.forEach(day => {
                                            if (y > 260) { doc.addPage(); y = 20; }
                                            doc.setFontSize(12);
                                            doc.setFont(undefined, 'bold');
                                            doc.text(`${day.date} — ${day.totalPieces} pcs, ${day.totalBills} bills, ₹${day.totalAmount}`, 14, y);
                                            y += 8;
                                            doc.setFontSize(9);
                                            doc.setFont(undefined, 'normal');
                                            // Product breakdown
                                            Object.entries(day.productBreakdown || {}).forEach(([name, info]) => {
                                                if (y > 275) { doc.addPage(); y = 20; }
                                                doc.text(`  ${name}: ${info.pieces} pcs (${info.brand})`, 14, y);
                                                y += 5;
                                            });
                                            // Brand breakdown
                                            const brandLine = Object.entries(day.brandBreakdown || {}).map(([b, c]) => `${b}: ${c} pcs`).join(' | ');
                                            if (brandLine) { doc.text(`  Brands: ${brandLine}`, 14, y); y += 5; }
                                            if (day.note) { doc.text(`  Notes: ${day.note}`, 14, y); y += 5; }
                                            y += 4;
                                        });
                                        const safeDate = todayStr.replace(/[^a-zA-Z0-9]/g, '_');
                                        const filename = `Daily_Sales_Report_${safeDate}.pdf`;
                                        if (isNative()) {
                                            const pdfBlob = doc.output('blob');
                                            await saveAndOpenPdf(filename, pdfBlob);
                                        } else {
                                            doc.save(filename);
                                        }
                                        showToast('Report generated!');
                                    } catch(e) { console.error(e); showToast('Failed to generate report'); }
                                }}>📄 Export Report</button>
                                    <button className="sales-export-btn email-btn" onClick={async () => {
                                        if (dailySalesData.length === 0) return showToast('No sales data to email');
                                        setEmailSending(true);
                                        try {
                                            const today = dailySalesData[0];
                                            await sendDailySalesEmail(today);
                                            showToast('📧 Sales report emailed!');
                                        } catch(e) { showToast('❌ Email failed'); }
                                        setEmailSending(false);
                                    }} disabled={emailSending}>{emailSending ? '⏳...' : '📧 Email Report'}</button>
                                </div>
                            </div>

                            {isLoadingSales ? (
                                <p style={{ padding: '16px', color: '#666' }}>Loading sales data...</p>
                            ) : dailySalesData.length === 0 ? (
                                <div className="sales-empty">
                                    <div className="sales-empty-icon">📊</div>
                                    <p>No sales data yet.<br/>Generate bills to see daily sales here.</p>
                                </div>
                            ) : (
                                dailySalesData.map(day => {
                                    const isOpen = openSalesDays[day.dateKey];
                                    const getBrandClass = (brand) => {
                                        const b = brand.toLowerCase();
                                        if (b === 'hawkins') return 'brand-hawkins';
                                        if (b === 'prestige') return 'brand-prestige';
                                        return 'brand-other';
                                    };

                                    return (
                                        <div className="sales-day-card" key={day.dateKey}>
                                            <div className="sales-day-header" onClick={() => setOpenSalesDays(p => ({ ...p, [day.dateKey]: !p[day.dateKey] }))}>
                                                <div className="sales-day-date">
                                                    <span className="sales-day-date-main">📅 {day.date}</span>
                                                    <span className="sales-day-date-sub">{day.totalBills} bill{day.totalBills !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="sales-day-summary">
                                                    <span className="sales-day-pieces">{day.totalPieces} pcs</span>
                                                    <span className={`sales-day-chevron${isOpen ? ' open' : ''}`}>▼</span>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="sales-day-detail">
                                                    {/* Total Amount */}
                                                    <div className="sales-detail-section">
                                                        <div className="sales-amount-row">
                                                            <span className="sales-amount-label">💰 Total Amount</span>
                                                            <span className="sales-amount-val">₹{day.totalAmount}</span>
                                                        </div>
                                                    </div>

                                                    {/* Bills */}
                                                    {day.bills && day.bills.length > 0 && (
                                                        <div className="sales-detail-section">
                                                            <div className="sales-detail-title">Bills</div>
                                                            <div className="sales-product-list">
                                                                {day.bills.map((b, i) => (
                                                                    <div key={i} className="sales-bill-item">
                                                                        <span className="sales-bill-customer">{b.customerName}</span>
                                                                        <span className="sales-bill-amount">₹{b.grandTotal} ({b.totalPieces} pcs)</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Product Breakdown */}
                                                    {Object.keys(day.productBreakdown || {}).length > 0 && (
                                                        <div className="sales-detail-section">
                                                            <div className="sales-detail-title">Product Breakdown</div>
                                                            <div className="sales-product-list">
                                                                {Object.entries(day.productBreakdown).sort((a,b) => b[1].pieces - a[1].pieces).map(([name, info]) => (
                                                                    <div key={name} className="sales-product-row">
                                                                        <span className="sales-product-name">{name}</span>
                                                                        <span className="sales-product-qty">{info.pieces} pcs</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Brand Breakdown */}
                                                    {Object.keys(day.brandBreakdown || {}).length > 0 && (
                                                        <div className="sales-detail-section">
                                                            <div className="sales-detail-title">Brand Breakdown</div>
                                                            <div className="sales-brand-list">
                                                                {Object.entries(day.brandBreakdown).sort((a,b) => b[1] - a[1]).map(([brand, count]) => (
                                                                    <div key={brand} className={`sales-brand-badge ${getBrandClass(brand)}`}>
                                                                        <span className="sales-brand-dot"></span>
                                                                        <span>{brand}</span>
                                                                        <span className="sales-brand-count">{count} pcs</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Daily Notes */}
                                                    <div className="sales-detail-section">
                                                        <div className="sales-detail-title">📝 Notes</div>
                                                        <textarea
                                                            className="sales-note-area"
                                                            placeholder="Add notes for this day... (e.g. Festival sale, Good day)"
                                                            value={dailyNoteEditing[day.dateKey] !== undefined ? dailyNoteEditing[day.dateKey] : (dailyNotes[day.dateKey] || '')}
                                                            onChange={e => setDailyNoteEditing(p => ({ ...p, [day.dateKey]: e.target.value }))}
                                                        />
                                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                            <button className="sales-note-save" style={{ flex: 1 }} onClick={async () => {
                                                                const noteText = dailyNoteEditing[day.dateKey];
                                                                if (noteText === undefined) return;
                                                                try {
                                                                    await saveDailyNoteLocal(day.dateKey, noteText);
                                                                    try { await saveDailyNoteToCloud(day.dateKey, noteText); } catch(e) {}
                                                                    setDailyNotes(p => ({ ...p, [day.dateKey]: noteText }));
                                                                    setDailyNoteEditing(p => { const n = {...p}; delete n[day.dateKey]; return n; });
                                                                    showToast('Note saved!');
                                                                } catch(e) { showToast('Failed to save note'); }
                                                            }}>💾 Save Note</button>
                                                            {(dailyNotes[day.dateKey] || dailyNoteEditing[day.dateKey]) && (
                                                                <button className="sales-note-save" style={{ flex: 0, background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2' }} onClick={async () => {
                                                                    if (!window.confirm('Delete this note?')) return;
                                                                    try {
                                                                        await deleteLocalDailyNote(day.dateKey);
                                                                        try { await deleteNoteFromCloud(day.dateKey); } catch(e) {}
                                                                        setDailyNotes(p => { const n = {...p}; delete n[day.dateKey]; return n; });
                                                                        setDailyNoteEditing(p => { const n = {...p}; delete n[day.dateKey]; return n; });
                                                                        showToast('Note deleted!');
                                                                    } catch(e) { showToast('Failed to delete note'); }
                                                                }}>🗑 Delete</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Manual Sale entries from manualSalesList shown at bottom of Sales tab */}
                    {tab === 'sales' && manualSalesList.length > 0 && (
                        <div style={{ padding: '0 16px 16px' }}>
                            <h3 style={{ fontSize: '0.95rem', color: 'var(--text2)', marginBottom: 10 }}>📋 Manual Sales Entries</h3>
                            {manualSalesList.sort((a,b) => b.timestamp - a.timestamp).map(sale => (
                                <div key={sale.saleId} style={{ background: '#f8f8f8', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>📅 {sale.date}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#555', marginTop: 2 }}>{sale.pieces} pieces · ₹{sale.amount}</div>
                                        {sale.notes && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>📝 {sale.notes}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>Manual</span>
                                        <button onClick={async () => {
                                            if (!window.confirm('Delete this sale?')) return;
                                            try {
                                                await deleteManualSale(sale.saleId);
                                                try { await deleteManualSaleFromCloud(sale.saleId); } catch(e) {}
                                                const updated = await getManualSales();
                                                setManualSalesList(updated);
                                                showToast('Sale deleted!');
                                            } catch(e) { showToast('Failed to delete'); }
                                        }} style={{ background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>🗑</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {activePdf && (
                    <div className="pdf-pane" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                        <div className="pdf-pane-header" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 'bold' }}>{activePdf.name}</span>
                            <button onClick={() => setActivePdf(null)} style={{ background: 'var(--text2)', borderRadius: 8, padding: '6px 12px', color: '#fff', border: 'none', fontWeight: 'bold' }}>Close</button>
                        </div>
                        <PdfCanvas src={activePdf.src} />
                    </div>
                )}
            </div>

            {/* Manual Sale Modal */}
            {manualSaleModal && (
                <div className="img-overlay" onClick={() => setManualSaleModal(false)}>
                    <div className="img-modal" style={{ textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 16 }}>➕ Add Manual Sale</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4, display: 'block' }}>Date</label>
                                <input type="date" className="search-input" style={{ width: '100%', padding: '10px' }} value={manualSaleForm.date} onChange={e => setManualSaleForm({ ...manualSaleForm, date: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4, display: 'block' }}>Pieces Sold</label>
                                    <input type="number" className="search-input" style={{ width: '100%', padding: '10px' }} placeholder="0" value={manualSaleForm.pieces} onChange={e => setManualSaleForm({ ...manualSaleForm, pieces: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4, display: 'block' }}>Amount (₹)</label>
                                    <input type="number" className="search-input" style={{ width: '100%', padding: '10px' }} placeholder="0" value={manualSaleForm.amount} onChange={e => setManualSaleForm({ ...manualSaleForm, amount: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4, display: 'block' }}>Notes (Optional)</label>
                                <textarea className="sales-note-area" placeholder="e.g. Festival sale, bulk order..." value={manualSaleForm.notes} onChange={e => setManualSaleForm({ ...manualSaleForm, notes: e.target.value })} style={{ marginTop: 0 }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--text2)' }} onClick={() => setManualSaleModal(false)}>Cancel</button>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--green)' }} onClick={async () => {
                                if (!manualSaleForm.date) return showToast('Please select a date');
                                const pieces = parseInt(manualSaleForm.pieces) || 0;
                                const amount = parseFloat(manualSaleForm.amount) || 0;
                                if (pieces === 0 && amount === 0) return showToast('Enter pieces or amount');
                                const ts = new Date(manualSaleForm.date).getTime();
                                const dateObj = new Date(manualSaleForm.date);
                                const humanDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                const saleRecord = {
                                    saleId: `manual-${Date.now()}`,
                                    dateKey: manualSaleForm.date,
                                    date: humanDate,
                                    pieces,
                                    amount,
                                    notes: manualSaleForm.notes || '',
                                    timestamp: ts,
                                };
                                try {
                                    await saveManualSale(saleRecord);
                                    try { await saveManualSaleToCloud(saleRecord); } catch(e) {}
                                    const updated = await getManualSales();
                                    setManualSalesList(updated);
                                    setManualSaleModal(false);
                                    setManualSaleForm({ date: '', pieces: '', amount: '', notes: '' });
                                    showToast('✅ Manual sale added!');
                                } catch(e) { showToast('Failed to save sale'); }
                            }}>Save Sale</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom PDF Modal */}
            {pdfModal && (
                <div className="img-overlay" onClick={() => setPdfModal(false)}>
                    <div className="img-modal" style={{ textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 16 }}>Attach New PDF</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Document Name" value={pdfForm.name} onChange={e => setPdfForm({ ...pdfForm, name: e.target.value })} />
                            <input type="file" accept="application/pdf" className="search-input" style={{ width: '100%', padding: '8px 12px' }} onChange={e => setPdfForm({ ...pdfForm, file: e.target.files[0] })} />
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--text2)' }} onClick={() => setPdfModal(false)}>Cancel</button>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--green)' }} onClick={handleAddPdf}>Add PDF</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Item Modal */}
            {addModal && (
                <div className="img-overlay" onClick={() => setAddModal(false)}>
                    <div className="img-modal" style={{ textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 16 }}>Add Custom Product</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Product Name (Optional)" value={customForm.name} onChange={e => setCustomForm({ ...customForm, name: e.target.value })} />
                            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Product Code (Optional)" value={customForm.code} onChange={e => setCustomForm({ ...customForm, code: e.target.value })} />
                            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Brand (e.g. Prestige, Vinod)" value={customForm.brand} onChange={e => setCustomForm({ ...customForm, brand: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="MRP (Optional)" type="number" value={customForm.mrp} onChange={e => setCustomForm({ ...customForm, mrp: e.target.value })} />
                                <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Case Pack Size" type="number" value={customForm.casePack} onChange={e => setCustomForm({ ...customForm, casePack: e.target.value })} />
                            </div>
                            <input className="search-input" style={{ width: '100%', paddingLeft: 12 }} placeholder="Options / Variations (e.g. Red, 5L, Silver)" value={customForm.options} onChange={e => setCustomForm({ ...customForm, options: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--text2)' }} onClick={() => setAddModal(false)}>Cancel</button>
                            <button className="img-modal-close" style={{ flex: 1, marginTop: 0, background: 'var(--green)' }} onClick={handleAddCustom}>Add Item</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {imgModal && (
                <div className="img-overlay" onClick={() => setImgModal(null)}>
                    <div className="img-modal" onClick={e => e.stopPropagation()}>
                        <div className="img-modal-circle">
                            <div className="img-modal-placeholder">📷 Image<br />Coming Soon</div>
                        </div>
                        <h3>{imgModal.name}</h3>
                        <p>Code: {imgModal.code} · MRP: ₹{imgModal.mrp}</p>
                        <button className="img-modal-close" onClick={() => setImgModal(null)}>Close</button>
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </>
    )
}
