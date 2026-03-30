export interface ExtratoItem {
  id: string;
  tipo: 'VENDA' | 'SANGRIA' | 'REFORCO' | 'ABERTURA';
  descricao: string;
  operador: string;
  horario: string;
  valor: number;
  isEntrada: boolean; // true = Verde (+), false = Vermelho (-)
}

export const extratoMock: ExtratoItem[] = [
  { id: '1', tipo: 'VENDA', descricao: 'Venda #1040 (Dinheiro)', operador: 'João Silva', horario: '10:28', valor: 6.00, isEntrada: true },
  { id: '2', tipo: 'VENDA', descricao: 'Venda #1041 (PIX)', operador: 'João Silva', horario: '10:20', valor: 16.00, isEntrada: true },
  { id: '3', tipo: 'SANGRIA', descricao: 'Retirada (Sangria)', operador: 'João Silva', horario: '10:10', valor: 14.00, isEntrada: false },
  { id: '4', tipo: 'ABERTURA', descricao: 'Abertura de Caixa', operador: 'João Silva', horario: '08:00', valor: 100.00, isEntrada: true },
];

export const resumoCaixaMock = {
  operador: "Michael Julian",
  dataAbertura: "29/03/2026",
  horaAbertura: "07:55",
  status: "ABERTO",
  saldoFisico: 108.00,
  fundoTroco: 100.00,
  vendasDinheiro: 22.00
};