// Mesmas fórmulas e arredondamentos do formulário original.
export const calcularMargem = (preco: number, custo: number) => preco > 0 ? Number((((preco - custo) / preco) * 100).toFixed(2)) : 0;
export const calcularCusto = (preco: number, margem: number) => Number((preco - preco * (margem / 100)).toFixed(2));
