import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document as DocumentType, DocumentCategory } from '../types';
import { toast } from 'sonner';

const MOCK_DOCUMENTS: DocumentType[] = [
  { id: 'doc_1', fileName: 'Declaration_T2_2025_Final.pdf', fileSize: '1.8 MB', uploadDate: Date.now() - 3600000 * 24 * 5, status: 'secure', url: 'mock_1', category: 'tax', source: 'admin', userId: 'mock_client_id' },
  { id: 'doc_2', fileName: 'Releve_Bancaire_BMO_Mai2026.pdf', fileSize: '840 KB', uploadDate: Date.now() - 3600000 * 24 * 12, status: 'secure', url: 'mock_2', category: 'bank', source: 'client', userId: 'mock_client_id' },
  { id: 'doc_3', fileName: 'Incorporation_TremblayTech_Registre.pdf', fileSize: '3.4 MB', uploadDate: Date.now() - 3600000 * 24 * 45, status: 'secure', url: 'mock_3', category: 'legal', source: 'client', userId: 'mock_client_id' },
  { id: 'doc_4', fileName: 'Contrat_Comptaflow_Elite_Signe.pdf', fileSize: '1.2 MB', uploadDate: Date.now() - 3600000 * 2, status: 'secure', url: 'mock_4', category: 'legal', source: 'admin', userId: 'mock_client_id' }
];

export function useDocuments(clientId?: string) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let uid = 'mock_client_id';
      let isMock = true;

      const localSession = localStorage.getItem('comptaflow_mock_session');
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          uid = parsed.user?.id || 'mock_client_id';
        } catch (e) {}
      } else {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            uid = data.session.user.id;
            isMock = uid.startsWith('mock_');
          }
        } catch (e) {
          // Offline fallback
        }
      }

      const targetId = clientId || uid;
      const effectiveIsMock = isMock || targetId.startsWith('mock_');
      
      if (effectiveIsMock) {
        setDocuments(MOCK_DOCUMENTS);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', targetId)
        .order('upload_date', { ascending: false });
      
      if (error) throw error;

      // Transformation des données SQL vers Typescript
      const mappedDocs = (data || []).map(d => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size,
        uploadDate: d.upload_date,
        status: d.status || 'secure',
        url: d.url,
        category: d.category || 'general',
        source: d.source || 'client',
        userId: d.user_id,
        metadata: d.metadata
      })) as DocumentType[];

      setDocuments(mappedDocs);
    } catch (e) {
      console.error("Docs fetch error:", e);
      setDocuments([]);
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
   * Téléversement de document vers Supabase Storage (Bucket 'vault')
   */
  const uploadDocument = async (file: File, category: DocumentCategory = 'general', targetUserId?: string) => {
    try {
      let uid = 'mock_client_id';
      let isMock = true;

      const localSession = localStorage.getItem('comptaflow_mock_session');
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          uid = parsed.user?.id || 'mock_client_id';
        } catch (e) {}
      } else {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            uid = data.session.user.id;
            isMock = uid.startsWith('mock_');
          }
        } catch (e) {
          // Offline fallback
        }
      }

      const finalTargetId = targetUserId || uid;
      const isAdminUpload = !!targetUserId;
      const effectiveIsMock = isMock || finalTargetId.startsWith('mock_');

      if (effectiveIsMock) {
        const newDoc: DocumentType = {
          id: 'doc_' + Date.now(),
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadDate: Date.now(),
          status: 'secure',
          url: 'mock_' + Date.now(),
          category: category,
          source: isAdminUpload ? 'admin' : 'client',
          userId: finalTargetId
        };
        setDocuments(prev => [newDoc, ...prev]);
        toast.success("Document déposé avec succès (Mode Démo).");
        return true;
      }
      
      // Structure de dossier : user_id/timestamp_filename
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${finalTargetId}/${fileName}`;
      
      // 1. Upload vers le bucket PRIVÉ 'vault'
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Enregistrement des métadonnées en base de données
      const newDoc = {
        file_name: file.name,
        file_size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: filePath,
        upload_date: Date.now(),
        status: 'secure',
        user_id: finalTargetId,
        category: category,
        source: isAdminUpload ? 'admin' : 'client'
      };

      const { error: dbError } = await supabase.from('documents').insert(newDoc);
      if (dbError) throw dbError;
      
      // 3. ANALYSE IA (Comptaflow VISION)
      if (!isAdminUpload) {
        toast.info("Analyse IA en cours...");
        try {
          const reader = new FileReader();
          const fileBase64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
          });

          const aiRes = await fetch('/api/ai/analyze-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileData: fileBase64, fileName: file.name, mimeType: file.type })
          });
          const aiData = await aiRes.json();
          
          if (aiData.success) {
            toast.success(`IA : ${aiData.analysis.type} détecté (${aiData.analysis.montant_total}$)`);
            await supabase.from('documents').update({ metadata: aiData.analysis }).eq('url', filePath);
          }
        } catch (aiErr) {
          console.warn("Échec analyse IA:", aiErr);
        }
      }
      
      fetchDocuments();
      return true;
    } catch (err: any) {
      console.error("Erreur Upload:", err);
      toast.error(err.message || "Erreur lors du dépôt du document.");
      return false;
    }
  };

  return { documents, loading, uploadDocument, getSecureDownloadUrl, refreshDocuments: fetchDocuments };
}
