import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document as DocumentType, DocumentCategory } from '../types';
import { toast } from 'sonner';

export function useDocuments(clientId?: string) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: sessData } = await supabase.auth.getSession();
      const uid = sessData?.session?.user?.id;
      if (!uid) { setDocuments([]); return; }

      const targetId = clientId || uid;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', targetId)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(d => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size,
        uploadDate: d.upload_date,
        status: d.status || 'secure',
        url: d.url,
        category: d.category || 'general',
        source: d.source || 'client',
        userId: d.user_id,
        metadata: d.metadata,
      })) as DocumentType[];

      setDocuments(mapped);
    } catch (e) {
      console.error("Docs fetch error:", e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const channel = supabase
      .channel('documents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  const getSecureDownloadUrl = async (documentPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(documentPath, 60);
      if (error) throw error;
      return data.signedUrl;
    } catch (e) {
      console.error("Erreur URL signée:", e);
      return null;
    }
  };

  const uploadDocument = async (file: File, category: DocumentCategory = 'general', targetUserId?: string) => {
    try {
      const { data: sessData } = await supabase.auth.getSession();
      const uid = sessData?.session?.user?.id;
      if (!uid) throw new Error("Non authentifié.");

      const finalTargetId = targetUserId || uid;
      const isAdminUpload = !!targetUserId;

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = `${finalTargetId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        file_name: file.name,
        file_size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: filePath,
        upload_date: Date.now(),
        status: 'secure',
        user_id: finalTargetId,
        category,
        source: isAdminUpload ? 'admin' : 'client',
      });

      if (dbError) throw dbError;

      toast.success("Document déposé avec succès.");
      fetchDocuments();
      return true;
    } catch (err: any) {
      console.error("Erreur Upload:", err);
      toast.error(err.message || "Erreur lors du dépôt.");
      return false;
    }
  };

  return { documents, loading, uploadDocument, getSecureDownloadUrl, refreshDocuments: fetchDocuments };
}
