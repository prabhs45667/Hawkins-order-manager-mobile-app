import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhjkjznotlrrtixiiwbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_6c4VlC7F1P5FbIWk_Scvtw_gdqFnPEz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to upload generated pdf Blobs to Supabase
export const uploadPDFToSupabase = async (pdfBlob, filename) => {
    try {
        const { data, error } = await supabase.storage
            .from('bills')
            .upload(filename, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (error) throw error;

        // Return the public URL for the file
        const { data: publicUrlData } = supabase.storage
            .from('bills')
            .getPublicUrl(filename)

        return publicUrlData.publicUrl;
    } catch (e) {
        console.error("Error uploading to Supabase Storage:", e);
        throw e;
    }
}

export const fetchSupabaseHistory = async () => {
    try {
        const { data, error } = await supabase.storage.from('bills').list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
        })
        if (error) throw error
        return data || []
    } catch (e) {
        console.error("Error fetching Supabase history:", e)
        return []
    }
}

export const deletePDFFromSupabase = async (filename) => {
    try {
        const { data, error } = await supabase.storage.from('bills').remove([filename])
        if (error) throw error
        return data
    } catch (e) {
        console.error("Error deleting from Supabase Storage:", e)
        throw e
    }
}
