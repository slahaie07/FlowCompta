import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document as DocumentType, DocumentCategory } from '../types';

export function useDocuments(clientId?: string) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const targetId = clientId || userData.user?.id;
      
      if (!targetId) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', targetId)
        .order('upload_date', { ascending: false });
      
      if (error) throw error;

      // Transformation des données SQL vers Typescript
      const mappedDocs = data.map(d => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size,
        uploadDate: d.upload_date,
        status: d.status || 'secure',
        url: d.url,
        category: d.category || 'general',
        source: d.source || 'client',
        userId: d.user_id
      })) as DocumentType[];

      setDocuments(mappedDocs);
    } catch (e) {
      console.error("Docs fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  /**
   * Génère un lien de téléchargement sécurisé et temporaire (Signé)
   * Indispensable pour la confidentialité des documents fiscaux.
   */
  const getSecureDownloadUrl = async (documentPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(documentPath, 60); // Lien valide 60 secondes
      
      if (error) throw error;
      return data.signedUrl;
    } catch (e) {
      console.error("Erreur de signature URL:", e);
      return null;
    }
  };

  /**
   * Téléversement de document (Client ou Admin)
   */
  const uploadDocument = async (file: File, category: DocumentCategory = 'general', targetUserId?: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Auth required");

      const finalTargetId = targetUserId || authData.user.id;
      const isAdminUpload = !!targetUserId;
      
      const filePath = `${finalTargetId}/${Date.now()}_${file.name}`;
      
      // 1. Upload vers le bucket PRIVÉ 'vault'
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Enregistrement en base de données
      const newDoc = {
        file_name: file.name,
        file_size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: filePath, // On stocke le chemin relatif pour la signature
        upload_date: Date.now(),
        status: 'secure',
        user_id: finalTargetId,
        category: category,
        source: isAdminUpload ? 'admin' : 'client'
      };

      const { error: dbError } = await supabase.from('documents').insert(newDoc);
      if (dbError) throw dbError;
      
      fetchDocuments();
      return true;
    } catch (err: any) {
      console.error("Upload error:", err);
      return false;
    }
  };

  return { documents, loading, uploadDocument, getSecureDownloadUrl, refreshDocuments: fetchDocuments };
}
