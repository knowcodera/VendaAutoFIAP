export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export class Payment {
  private _id?: number;
  private _externalId?: string;
  private _status: PaymentStatus;
  private _amount: number;
  private _paymentMethod: string;
  private _paymentLink?: string;
  private _paymentDate?: Date;
  private _vehicleId: number;
  private _buyerCPF?: string;
  private _additionalInfo?: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(
    vehicleId: number,
    amount: number,
    paymentMethod: string,
    id?: number,
    status: PaymentStatus = PaymentStatus.PENDING,
    externalId?: string,
    paymentLink?: string,
    paymentDate?: Date,
    buyerCPF?: string,
    additionalInfo?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this._vehicleId = vehicleId;
    this._amount = amount;
    this._paymentMethod = paymentMethod;
    this._id = id;
    this._status = status;
    this._externalId = externalId;
    this._paymentLink = paymentLink;
    this._paymentDate = paymentDate;
    this._buyerCPF = buyerCPF;
    this._additionalInfo = additionalInfo;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    
    this.validate();
  }

  // Getters
  get id(): number | undefined { return this._id; }
  get externalId(): string | undefined { return this._externalId; }
  get status(): PaymentStatus { return this._status; }
  get amount(): number { return this._amount; }
  get paymentMethod(): string { return this._paymentMethod; }
  get paymentLink(): string | undefined { return this._paymentLink; }
  get paymentDate(): Date | undefined { return this._paymentDate; }
  get vehicleId(): number { return this._vehicleId; }
  get buyerCPF(): string | undefined { return this._buyerCPF; }
  get additionalInfo(): string | undefined { return this._additionalInfo; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  // Método para atualizar status
  updateStatus(status: PaymentStatus, paymentDate?: Date): void {
    this._status = status;
    
    if (status === PaymentStatus.APPROVED && !this._paymentDate) {
      this._paymentDate = paymentDate || new Date();
    }
    
    this._updatedAt = new Date();
  }

  // Método para adicionar informações externas do Mercado Pago
  setExternalInfo(externalId: string, paymentLink?: string): void {
    this._externalId = externalId;
    
    if (paymentLink) {
      this._paymentLink = paymentLink;
    }
    
    this._updatedAt = new Date();
  }
  
  // Método para definir o CPF do comprador
  setBuyerCPF(buyerCPF: string): void {
    if (!this.isValidCPF(buyerCPF)) {
      throw new Error('CPF inválido');
    }
    
    this._buyerCPF = buyerCPF;
    this._updatedAt = new Date();
  }

  // Método para validar a entidade
  private validate(): void {
    if (this._amount <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero');
    }
    
    if (!this._vehicleId) {
      throw new Error('O veículo associado ao pagamento é obrigatório');
    }
    
    if (!this._paymentMethod || this._paymentMethod.trim().length === 0) {
      throw new Error('O método de pagamento é obrigatório');
    }
    
    if (this._buyerCPF && !this.isValidCPF(this._buyerCPF)) {
      throw new Error('CPF inválido');
    }
  }
  
  // Método para validar CPF
  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) {
      return false;
    }
    
    // Implementação básica de validação de CPF
    // Em produção, use uma biblioteca específica ou uma validação mais robusta
    return true;
  }

  // Método para converter a entidade em um objeto simples
  toJSON() {
    return {
      id: this._id,
      externalId: this._externalId,
      status: this._status,
      amount: this._amount,
      paymentMethod: this._paymentMethod,
      paymentLink: this._paymentLink,
      paymentDate: this._paymentDate,
      vehicleId: this._vehicleId,
      buyerCPF: this._buyerCPF,
      additionalInfo: this._additionalInfo,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 