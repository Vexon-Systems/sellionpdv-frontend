import { 
    LockOpen, Lock, Box, Coins, DollarSign, 
    ArrowDownToLine, ArrowUpFromLine, Receipt, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extratoMock, resumoCaixaMock } from "./mockCaixa";
import { MovimentacaoCaixaModal } from "./components/MovimentacaoCaixaModal";
import { FechamentoCaixaModal } from "./components/FechamentoCaixaModal";
import { useState } from "react";

export function ControleCaixaView(){

    const [modalAtivo, setModalAtivo] = useState<'SANGRIA' | 'REFORCO' | null>(null);
    const [isFechamentoOpen, setIsFechamentoOpen] = useState(false);

    // Função auxiliar para escolher o ícone baseado no tipo de movimentação
    const renderIconeExtrato = (tipo: string) => {
        switch(tipo){
            case 'VENDA': return <Receipt size={18} className="text-gray-500" />;
            case 'SANGRIA': return <ArrowDownToLine size={18} className="text-red-500" />;
            case 'REFORCO': return <ArrowUpFromLine size={18} className="text-green-500" />;
            case 'ABERTURA': return <KeyRound size={18} className="text-primary" />;
            default: return <Box size={18} />;
        }
    };

    return(
        <div className="flex flex-col h-screen w-full bg-white overflow-y-auto p-8">
      
            {/* 1 - Cabeçalho */}
            <div className="flex justify-between items-start mb-8">
                <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Controle de Caixa</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Operador: {resumoCaixaMock.operador} | Abertura: {resumoCaixaMock.dataAbertura} às {resumoCaixaMock.horaAbertura}
                </p>
                </div>
                
                {/* Badge de Status */}
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 font-medium border border-green-200 shadow-sm">
                <LockOpen size={18} />
                Caixa Aberto
                </div>
            </div>

            {/* 2 - Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">Saldo Físico (Gaveta)</h3>
                    <Box size={20} className="text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-primary mb-1">
                    {resumoCaixaMock.saldoFisico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-500">Dinheiro na gaveta.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">Fundo de Troco</h3>
                    <Coins size={20} className="text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                    {resumoCaixaMock.fundoTroco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-500">Lançado na abertura.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">Vendas em Dinheiro</h3>
                    <DollarSign size={20} className="text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                    {resumoCaixaMock.vendasDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-500">Apenas em espécie.</p>
                </div>
            </div>

            {/* 3 - Barra de ações */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    <Button
                        onClick={() => setModalAtivo('SANGRIA')} 
                        variant="outline" 
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <ArrowDownToLine size={16} className="mr-2" /> Sangria (Retirada)
                    </Button>

                    <Button 
                        onClick={() => setModalAtivo('REFORCO')}
                        variant="outline" 
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                        <ArrowUpFromLine size={16} className="mr-2" /> Reforço (Entrada)
                    </Button>
                    </div>

                    <Button 
                        onClick={() => setIsFechamentoOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                    >
                        <Lock size={16} className="mr-2" /> Iniciar Fechamento
                    </Button>
            </div>

            {/* 4 - Extrato de Movimentação */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-800">Extrato de Movimentações</h3>
                <span className="text-xs text-gray-500 font-medium">Hoje, 15 de Março</span>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2">
                {extratoMock.map((item, index) => (
                    <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 ${index !== extratoMock.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                    <div className="flex items-center gap-4">
                        {/* Ícone Redondinho */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${item.tipo === 'SANGRIA' ? 'bg-red-100' : item.tipo === 'ABERTURA' ? 'bg-primary/10' : 'bg-gray-100'}
                        `}>
                        {renderIconeExtrato(item.tipo)}
                        </div>
                        
                        <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.descricao}</p>
                        <p className="text-xs text-gray-500">{item.horario} - Op: {item.operador}</p>
                        </div>
                    </div>

                    <div className={`font-bold ${item.isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                        {item.isEntrada ? '+ ' : '- '}
                        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            
            <MovimentacaoCaixaModal
                tipo={modalAtivo}
                onClose={() => setModalAtivo(null)}    
            />

            <FechamentoCaixaModal 
                isOpen={isFechamentoOpen} 
                onClose={() => setIsFechamentoOpen(false)} 
            />
        </div>
    )
}