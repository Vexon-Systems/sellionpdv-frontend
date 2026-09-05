import { useRef } from 'react';
import { Pen, X, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

export function ProdutoImagem({ imagemAtual, isUploading, onUploadImagem, onChange }: {
    imagemAtual?: string; isUploading: boolean;
    onUploadImagem: (file: File) => Promise<string>; onChange: (url: string) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await onUploadImagem(file);
                onChange(url);
                toast.success("Imagem enviada com sucesso!");
            } catch {
                toast.error("Erro no upload", { description: "Não foi possível enviar a imagem. Tente novamente." });
            }
        }
    };


    return (
        <>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative group shrink-0" onClick={() => fileInputRef.current?.click()}>
                {imagemAtual ? (
                    <>
                        <img src={imagemAtual} alt="Produto" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Pen className="text-white w-6 h-6" /></div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(""); }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-sm cursor-pointer"
                            title="Remover imagem"
                        >
                            <X size={12} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        {isUploading ? <Loader2 className="animate-spin w-8 h-8" /> : <><ImagePlus className="w-8 h-8 mb-1" /><span className="text-[10px] font-medium uppercase tracking-wider">Adicionar</span></>}
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </>
    );
}
