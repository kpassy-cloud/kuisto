'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Télécharger Kuisto
        </h1>

        <p className="text-gray-600 mb-6">
          Cliquez sur le bouton ci-dessous pour télécharger le code source complet du projet Kuisto.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">Taille du fichier</p>
          <p className="text-lg font-semibold text-gray-900">9.9 MB</p>
        </div>

        <a href="/api/download-project">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg">
            <Download className="w-5 h-5 mr-2" />
            Télécharger le projet
          </Button>
        </a>

        <p className="text-xs text-gray-400 mt-4">
          kuisto-project.zip • Prêt pour GitHub & Vercel
        </p>
      </div>
    </div>
  );
}
