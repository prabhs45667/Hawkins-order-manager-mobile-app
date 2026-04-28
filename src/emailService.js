/**
 * emailService.js — EmailJS integration for Hawkins Order Manager
 * Template variables used (must match EmailJS template exactly):
 *   {{type}}, {{date}}, {{owner_name}}, {{customer_name}},
 *   {{total_items}}, {{total_pieces}}, {{grand_total}},
 *   {{items_rows}}, {{name}}
 */

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || '';
const OWNER_NAME = import.meta.env.VITE_OWNER_NAME || '';

let emailjsInitialized = false;

/** Dynamically load EmailJS SDK and initialize it. */
const loadEmailJS = () => {
    return new Promise((resolve, reject) => {
        if (emailjsInitialized && window.emailjs) {
            return resolve(window.emailjs);
        }
        if (window.emailjs) {
            window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            emailjsInitialized = true;
            return resolve(window.emailjs);
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            emailjsInitialized = true;
            resolve(window.emailjs);
        };
        script.onerror = () => reject(new Error('Failed to load EmailJS SDK'));
        document.head.appendChild(script);
    });
};

/**
 * Build HTML <tr> rows for the items table.
 * Matches the <thead> columns: S.No | Name | Code | Quantity | MRP | Discount | Final Price
 */
const buildItemRows = (lineItems) => {
    if (!lineItems || lineItems.length === 0) {
        return `<tr><td colspan="7" style="padding:10px;text-align:center;color:#888;border:1px solid #ddd;">No items</td></tr>`;
    }

    return lineItems.map((item, i) => {
        // Quantity string
        let qtyStr = '';
        if (item.type === 'box') {
            qtyStr = `${item.qty} Box${item.qty !== 1 ? 'es' : ''} (${item.pieces} pcs)`;
        } else {
            qtyStr = `${item.pieces} Piece${item.pieces !== 1 ? 's' : ''}`;
        }

        // Discount %
        let discStr = '—';
        if (item.mrp > 0 && item.finalPrice !== undefined && item.pieces > 0) {
            const rawTotal = item.pieces * item.mrp;
            if (rawTotal > 0 && item.finalPrice < rawTotal) {
                const discPct = Math.round((1 - item.finalPrice / rawTotal) * 100);
                discStr = `${discPct}%`;
            } else {
                discStr = '0%';
            }
        }

        // Final price
        const finalStr = item.finalPrice !== undefined ? `₹${item.finalPrice}` : '—';
        const mrpStr = item.mrp ? `₹${item.mrp}` : '—';

        const rowBg = i % 2 === 0 ? '#ffffff' : '#f9f9f9';

        return `<tr style="background:${rowBg};">
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;">${item.name || '—'}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${item.code || '—'}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${qtyStr}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${mrpStr}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${discStr}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;font-weight:700;">${finalStr}</td>
</tr>`;
    }).join('\n');
};

/**
 * Build ORDER rows (no MRP/Discount/Price columns — just qty).
 * Re-uses the same 7-column table, fills blanks with '—'.
 */
const buildOrderRows = (lineItems) => {
    if (!lineItems || lineItems.length === 0) {
        return `<tr><td colspan="7" style="padding:10px;text-align:center;color:#888;border:1px solid #ddd;">No items</td></tr>`;
    }

    return lineItems.map((item, i) => {
        const qtyStr = item.type === 'box'
            ? `${item.qty} Box${item.qty !== 1 ? 'es' : ''}`
            : `${item.qty} Piece${item.qty !== 1 ? 's' : ''}`;

        const rowBg = i % 2 === 0 ? '#ffffff' : '#f9f9f9';

        return `<tr style="background:${rowBg};">
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;">${item.name || '—'}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${item.code || '—'}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${qtyStr}</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">—</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">—</td>
  <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">—</td>
</tr>`;
    }).join('\n');
};

/**
 * Send email for a new Bill.
 * @param {Object} billData - { customerName, date, grandTotal, totalBoxes, totalPieces, lineItems }
 */
export const sendBillEmail = async (billData) => {
    try {
        const ejs = await loadEmailJS();

        const lineItems = billData.lineItems || [];
        const totalPieces = billData.totalPieces ||
            lineItems.reduce((sum, i) => sum + (i.pieces || 0), 0);

        const params = {
            to_email: OWNER_EMAIL,
            name: OWNER_NAME,                          // {{name}} — From Name field
            owner_name: OWNER_NAME,                    // {{owner_name}} — greeting inside body
            type: 'Bill',                              // {{type}}
            date: billData.date,                       // {{date}}
            customer_name: billData.customerName || 'Walk-in Customer', // {{customer_name}}
            total_items: String(lineItems.length),     // {{total_items}}
            total_pieces: String(totalPieces),         // {{total_pieces}}
            grand_total: String(billData.grandTotal || 0), // {{grand_total}}
            items_rows: buildItemRows(lineItems),       // {{items_rows}}
        };

        await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        console.log('✅ Bill email sent successfully');
    } catch (err) {
        console.error('❌ Bill email failed:', err);
        throw err;
    }
};

/**
 * Send email for a new Order (Quote / unbilled).
 * @param {Object} orderData - { date, totalBoxes, totalPieces, lineItems }
 */
export const sendOrderEmail = async (orderData) => {
    try {
        const ejs = await loadEmailJS();

        const lineItems = orderData.lineItems || [];
        const totalPieces = orderData.totalPieces ||
            lineItems.reduce((sum, i) => sum + (i.pieces || i.qty || 0), 0);

        const params = {
            to_email: OWNER_EMAIL,
            name: OWNER_NAME,
            owner_name: OWNER_NAME,
            type: 'Order',                             // {{type}}
            date: orderData.date,
            customer_name: 'Order (Unbilled)',
            total_items: String(lineItems.length),
            total_pieces: String(totalPieces),
            grand_total: 'N/A',
            items_rows: buildOrderRows(lineItems),
        };

        await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        console.log('✅ Order email sent successfully');
    } catch (err) {
        console.error('❌ Order email failed:', err);
        throw err;
    }
};

/**
 * Send daily sales summary email.
 * @param {Object} salesDay - Aggregated sales day object
 */
export const sendDailySalesEmail = async (salesDay) => {
    try {
        const ejs = await loadEmailJS();

        // Build rows from product breakdown
        const products = Object.entries(salesDay.productBreakdown || {});
        const lineItems = products.map(([name, info]) => ({
            name,
            code: '—',
            type: 'pcs',
            qty: info.pieces,
            pieces: info.pieces,
            mrp: undefined,
            finalPrice: undefined,
        }));

        const params = {
            to_email: OWNER_EMAIL,
            name: OWNER_NAME,
            owner_name: OWNER_NAME,
            type: 'Daily Sales Report',
            date: salesDay.date,
            customer_name: `${salesDay.totalBills} Bill${salesDay.totalBills !== 1 ? 's' : ''}`,
            total_items: String(products.length),
            total_pieces: String(salesDay.totalPieces || 0),
            grand_total: String(salesDay.totalAmount || 0),
            items_rows: buildOrderRows(lineItems),
        };

        await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        console.log('✅ Daily sales email sent');
    } catch (err) {
        console.error('❌ Daily sales email failed:', err);
        throw err;
    }
};

/**
 * Send email for a PDF from History tab.
 * @param {Object} fileRecord - { name, type, created_at, extraData }
 */
export const sendHistoryPdfEmail = async (fileRecord) => {
    try {
        const ejs = await loadEmailJS();

        const createdAt = new Date(fileRecord.created_at).toLocaleString('en-IN');
        const customerName = fileRecord.extraData?.customerName || 'PDF Record';

        // If extraData has line items, include them; otherwise show file info row
        let lineItems = [];
        if (fileRecord.extraData?.orders) {
            // It's an order record — reconstruct minimal items
            const orders = fileRecord.extraData.orders;
            const customItems = fileRecord.extraData.customItems || [];
            const allItems = [...customItems];
            Object.entries(orders).forEach(([id, o]) => {
                const found = allItems.find(c => c.id === id);
                if (found) lineItems.push({ ...found, ...o, pieces: o.qty, code: found.code || '—' });
            });
        }

        // Fallback: single-row with filename
        if (lineItems.length === 0) {
            lineItems = [{
                name: fileRecord.name,
                code: '—',
                type: 'pcs',
                qty: 1,
                pieces: 1,
                mrp: undefined,
                finalPrice: undefined,
            }];
        }

        const params = {
            to_email: OWNER_EMAIL,
            name: OWNER_NAME,
            owner_name: OWNER_NAME,
            type: fileRecord.type === 'Bill' ? 'Bill (History)' : 'Order (History)',
            date: createdAt,
            customer_name: customerName,
            total_items: String(lineItems.length),
            total_pieces: '—',
            grand_total: '—',
            items_rows: buildOrderRows(lineItems),
        };

        await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
        console.log('✅ History PDF email sent');
    } catch (err) {
        console.error('❌ History PDF email failed:', err);
        throw err;
    }
};
