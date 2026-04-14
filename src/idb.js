export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('HawkinsDB', 3)
        request.onupgradeneeded = (e) => {
            const db = e.target.result
            if (!db.objectStoreNames.contains('pdfs')) {
                db.createObjectStore('pdfs', { keyPath: 'name' })
            }
            if (!db.objectStoreNames.contains('customPdfs')) {
                db.createObjectStore('customPdfs', { keyPath: 'name' })
            }
            if (!db.objectStoreNames.contains('mrpOverrides')) {
                db.createObjectStore('mrpOverrides', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('clients')) {
                db.createObjectStore('clients', { keyPath: 'name' })
            }
            if (!db.objectStoreNames.contains('customProducts')) {
                db.createObjectStore('customProducts', { keyPath: 'id' })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export const savePDFToLocal = async (name, blob, type, extraData = null) => {
    // 1. Read the blob first BEFORE starting the transaction
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })

    // 2. Now start the transaction
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readwrite')
        const store = tx.objectStore('pdfs')
        const record = { name, data: dataUrl, created_at: new Date().toISOString(), type, extraData }
        const req = store.put(record)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

export const getLocalHistory = async () => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readonly')
        const store = tx.objectStore('pdfs')
        const req = store.getAll()
        req.onsuccess = () => {
            const sorted = req.result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            resolve(sorted)
        }
        req.onerror = () => reject(req.error)
    })
}

export const deleteLocalPDF = async (name) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readwrite')
        const store = tx.objectStore('pdfs')
        const req = store.delete(name)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

export const renameLocalPDF = async (oldName, newName) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readwrite')
        const store = tx.objectStore('pdfs')
        const getReq = store.get(oldName)
        getReq.onsuccess = () => {
            const record = getReq.result
            if (!record) return reject(new Error('Record not found'))
            record.name = newName
            store.put(record)
            store.delete(oldName)
            resolve(true)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

// ---- Custom PDFs persistence ----

export const saveCustomPdf = async (name, dataUrl) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('customPdfs', 'readwrite')
        const store = tx.objectStore('customPdfs')
        const req = store.put({ name, data: dataUrl, created_at: new Date().toISOString() })
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

export const getCustomPdfs = async () => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('customPdfs', 'readonly')
        const store = tx.objectStore('customPdfs')
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
    })
}

export const deleteCustomPdf = async (name) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('customPdfs', 'readwrite')
        const store = tx.objectStore('customPdfs')
        const req = store.delete(name)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

// ---- MRP Overrides persistence ----

export const saveMrpOverride = async (id, mrp) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('mrpOverrides', 'readwrite')
        const store = tx.objectStore('mrpOverrides')
        const req = store.put({ id, mrp })
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

export const getMrpOverrides = async () => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('mrpOverrides', 'readonly')
        const store = tx.objectStore('mrpOverrides')
        const req = store.getAll()
        req.onsuccess = () => {
            const map = {}
            ;(req.result || []).forEach(r => { map[r.id] = r.mrp })
            resolve(map)
        }
        req.onerror = () => reject(req.error)
    })
}

// ---- Custom Products persistence ----

export const saveCustomProduct = async (product) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('customProducts', 'readwrite')
        const store = tx.objectStore('customProducts')
        const req = store.put(product)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
    })
}

export const getCustomProducts = async () => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('customProducts', 'readonly')
        const store = tx.objectStore('customProducts')
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
    })
}

// ---- Clients Ledgers persistence ----

export const saveClientBill = async (clientName, billData) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            const existingClient = getReq.result || { name: normalizedName, displayName: clientName.trim(), bills: [], receipts: [], amountReceived: 0 }
            
            if (!existingClient.receipts) {
                existingClient.receipts = [];
                // Migrate old amountReceived into receipts history safely
                if (existingClient.amountReceived && existingClient.amountReceived > 0) {
                    existingClient.receipts.push({ 
                        amount: existingClient.amountReceived, 
                        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 
                        timestamp: Date.now() - 100000 
                    });
                }
            }

            existingClient.bills.push(billData)
            const putReq = store.put(existingClient)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export const getClients = async () => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readonly')
        const store = tx.objectStore('clients')
        const req = store.getAll()
        req.onsuccess = () => {
            const clients = req.result || [];
            // Auto-migrate old clients
            clients.forEach(c => {
                if (!c.receipts) {
                    c.receipts = [];
                    if (c.amountReceived && c.amountReceived > 0) {
                        c.receipts.push({ amount: c.amountReceived, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), timestamp: Date.now() - 100000 });
                    }
                }
            });
            resolve(clients);
        }
        req.onerror = () => reject(req.error)
    })
}

export const updateClientPayment = async (clientName, amount, customDateStr, customTimestamp, remarks) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            const existingClient = getReq.result
            if (!existingClient) return reject(new Error('Client not found'))
            
            if (!existingClient.receipts) existingClient.receipts = [];
            // Migrate old if exists
            if (existingClient.amountReceived && existingClient.amountReceived > 0 && existingClient.receipts.length === 0) {
                existingClient.receipts.push({ 
                    amount: existingClient.amountReceived, 
                    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 
                    timestamp: Date.now() - 100000 
                });
            }
            
            existingClient.amountReceived = (parseFloat(existingClient.amountReceived) || 0) + amount; // Maintain running total just in case
            
            existingClient.receipts.push({
                amount: amount,
                date: customDateStr || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                timestamp: customTimestamp || Date.now(),
                remarks: remarks || ''
            });

            const putReq = store.put(existingClient)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export const createManualClient = async (clientName) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            if (getReq.result) return reject(new Error('Client already exists'));
            
            const newClient = {
                name: normalizedName,
                displayName: clientName.trim(),
                bills: [],
                receipts: [],
                amountReceived: 0
            }
            
            const putReq = store.put(newClient)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export const addManualBill = async (clientName, amount, customDateStr, customTimestamp, remarks) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            const existingClient = getReq.result
            if (!existingClient) return reject(new Error('Client not found'))
            
            if (!existingClient.receipts) {
                existingClient.receipts = [];
                if (existingClient.amountReceived && existingClient.amountReceived > 0) {
                    existingClient.receipts.push({ 
                        amount: existingClient.amountReceived, 
                        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 
                        timestamp: Date.now() - 100000 
                    });
                }
            }

            const today = customDateStr || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            
            existingClient.bills.push({
                filename: 'Manual Record',
                date: today,
                timestamp: customTimestamp || Date.now(),
                totalItems: 0,
                grandTotal: amount,
                boxes: 0,
                pieces: 0,
                remarks: remarks || ''
            })

            const putReq = store.put(existingClient)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export const editClientRecord = async (clientName, type, oldTimestamp, updates) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            const client = getReq.result
            if (!client) return reject(new Error('Client not found'))
            
            if (type === 'bill') {
                const idx = client.bills.findIndex(b => b.timestamp === oldTimestamp);
                if (idx !== -1) {
                    client.bills[idx].grandTotal = updates.amount;
                    client.bills[idx].date = updates.dateStr || client.bills[idx].date;
                    client.bills[idx].timestamp = updates.newTimestamp || client.bills[idx].timestamp;
                    if (updates.remarks !== undefined) client.bills[idx].remarks = updates.remarks;
                }
            } else if (type === 'receipt') {
                const idx = client.receipts.findIndex(r => r.timestamp === oldTimestamp);
                if (idx !== -1) {
                    client.receipts[idx].amount = updates.amount;
                    client.receipts[idx].date = updates.dateStr || client.receipts[idx].date;
                    client.receipts[idx].timestamp = updates.newTimestamp || client.receipts[idx].timestamp;
                    if (updates.remarks !== undefined) client.receipts[idx].remarks = updates.remarks;
                    
                    client.amountReceived = client.receipts.reduce((sum, r) => sum + r.amount, 0);
                }
            }

            const putReq = store.put(client)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}

export const deleteClientRecord = async (clientName, type, timestamp) => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clients', 'readwrite')
        const store = tx.objectStore('clients')
        const normalizedName = clientName.trim().toLowerCase()
        const getReq = store.get(normalizedName)
        
        getReq.onsuccess = () => {
            const client = getReq.result
            if (!client) return reject(new Error('Client not found'))
            
            if (type === 'bill') {
                client.bills = client.bills.filter(b => b.timestamp !== timestamp);
            } else if (type === 'receipt') {
                client.receipts = client.receipts.filter(r => r.timestamp !== timestamp);
                client.amountReceived = client.receipts.reduce((sum, r) => sum + r.amount, 0);
            }

            const putReq = store.put(client)
            putReq.onsuccess = () => resolve(true)
            putReq.onerror = () => reject(putReq.error)
        }
        getReq.onerror = () => reject(getReq.error)
    })
}
