export class ChaveIdempotenciaCriacao {
    private chaveAtual: string | null = null

    obter(): string {
        if (!this.chaveAtual) {
            this.chaveAtual = crypto.randomUUID()
        }
        return this.chaveAtual
    }

    concluirIntento(): void {
        this.chaveAtual = null
    }
}
