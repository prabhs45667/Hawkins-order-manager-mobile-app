/**
 * nativePdf.js — Native PDF helpers for Capacitor (Android/iOS)
 * Handles saving PDFs to the device Downloads folder and opening them
 * with the phone's built-in PDF viewer.
 */

import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

/**
 * Check if we're running inside a native Capacitor app (not browser)
 */
export const isNative = () => Capacitor.isNativePlatform()

/**
 * Save a PDF blob to the device's Documents directory.
 * Returns the saved file URI.
 */
export const saveToDevice = async (filename, blob) => {
    // Convert blob to base64
    const base64 = await blobToBase64(blob)

    // Ensure filename ends with .pdf
    const path = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    const result = await Filesystem.writeFile({
        path: path,
        data: base64,
        directory: Directory.Documents,
        recursive: true
    })

    console.log('File written to:', result.uri)
    return result.uri
}

/**
 * Open a PDF file using the device's native PDF viewer.
 */
export const openWithNativeViewer = async (fileUri) => {
    try {
        const { FileOpener } = await import('@capacitor-community/file-opener')
        await FileOpener.open({
            filePath: fileUri,
            contentType: 'application/pdf',
            openWithDefault: true // This helps Android find the right app
        })
    } catch (e) {
        console.error('Failed to open PDF with native viewer:', e)
        throw e
    }
}

/**
 * Open a bundled PDF asset (from public/pdf/) using the native viewer.
 * Copies the asset to a temp location first so the file opener can access it.
 */
export const openBundledPdf = async (relativePath) => {
    try {
        // Read the bundled file from the app's public assets
        // In Capacitor, files in public/ are served from the webview root
        const response = await fetch(relativePath)
        if (!response.ok) throw new Error(`Failed to fetch ${relativePath}`)
        const blob = await response.blob()
        const base64 = await blobToBase64(blob)

        // Write to a temp location the file opener can access
        const filename = relativePath.split('/').pop()
        const result = await Filesystem.writeFile({
            path: `hawkins_temp/${filename}`,
            data: base64,
            directory: Directory.Cache,
            recursive: true
        })

        // Open with native viewer
        const { FileOpener } = await import('@capacitor-community/file-opener')
        await FileOpener.open({
            filePath: result.uri,
            contentType: 'application/pdf'
        })
    } catch (e) {
        console.error('Failed to open bundled PDF:', e)
        throw e
    }
}

/**
 * Save generated PDF and open it natively.
 * Used for Order/Bill PDFs generated via jsPDF.
 */
export const saveAndOpenPdf = async (filename, blob) => {
    const uri = await saveToDevice(filename, blob)
    await openWithNativeViewer(uri)
    return uri
}

// ---- Utility ----

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            // Remove the data:...;base64, prefix
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}
