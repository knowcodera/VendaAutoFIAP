import { Payment } from "./Payment"; // Importar entidade Payment
import { VehicleImage } from "./VehicleImage"; // Importar entidade VehicleImage

/**
 * Entidade de Veículo
 */
export class Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  isSold: boolean;
  buyerCPF: string | null;
  saleDate?: Date;
  // Novos campos para filtros
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  numberOfDoors?: number;
  sellerId?: number;
  createdAt: Date;
  updatedAt: Date;
  images?: VehicleImage[]; // Adicionar propriedade images
  payment?: Payment; // Adicionar propriedade para o pagamento relacionado

  constructor(props: {
    id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
    price: number;
    isSold: boolean;
    buyerCPF?: string | null;
    saleDate?: Date;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    condition?: string;
    numberOfDoors?: number;
    sellerId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    images?: VehicleImage[];
    payment?: Payment; 
  }) {
    this.id = props.id;
    this.brand = props.brand;
    this.model = props.model;
    this.year = props.year;
    this.color = props.color;
    this.price = props.price;
    this.isSold = props.isSold ?? false;
    this.buyerCPF = props.buyerCPF ?? null;
    this.saleDate = props.saleDate;
    this.mileage = props.mileage;
    this.fuelType = props.fuelType;
    this.transmission = props.transmission;
    this.condition = props.condition;
    this.numberOfDoors = props.numberOfDoors;
    this.sellerId = props.sellerId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.images = props.images ?? []; // Inicializar images
    this.payment = props.payment; // Atribuir pagamento
  }

  // Método para validar a entidade
  private validate(): void {
    if (!this.brand || this.brand.trim().length === 0) {
      throw new Error('A marca é obrigatória');
    }
    
    if (!this.model || this.model.trim().length === 0) {
      throw new Error('O modelo é obrigatório');
    }
    
    if (!this.year || this.year < 1886 || this.year > new Date().getFullYear() + 1) {
      throw new Error('Ano inválido');
    }
    
    if (!this.color || this.color.trim().length === 0) {
      throw new Error('A cor é obrigatória');
    }
    
    if (this.price <= 0) {
      throw new Error('O preço deve ser maior que zero');
    }

    // Validações opcionais para os novos campos
    if (this.mileage !== undefined && this.mileage < 0) {
      throw new Error('A quilometragem não pode ser negativa');
    }

    const validFuelTypes = ['gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido'];
    if (this.fuelType && !validFuelTypes.includes(this.fuelType)) {
      throw new Error('Tipo de combustível inválido');
    }

    const validTransmissions = ['manual', 'automatico', 'cvt', 'semi-automatico'];
    if (this.transmission && !validTransmissions.includes(this.transmission)) {
      throw new Error('Tipo de câmbio inválido');
    }

    const validConditions = ['novo', 'usado'];
    if (this.condition && !validConditions.includes(this.condition)) {
      throw new Error('Condição do veículo inválida');
    }
  }

  /**
   * Marca o veículo como vendido para um determinado comprador
   * @param buyerCPF CPF do comprador
   */
  sell(buyerCPF: string): void {
    if (this.isSold) {
      throw new Error('Este veículo já está vendido');
    }
    
    if (!buyerCPF || buyerCPF.trim().length < 11) {
      throw new Error('CPF do comprador inválido');
    }
    
    this.isSold = true;
    this.buyerCPF = buyerCPF;
    this.saleDate = new Date();
    this.updatedAt = new Date();
  }

  // Método para atualizar os dados do veículo
  update(
    brand?: string,
    model?: string,
    year?: number,
    color?: string,
    price?: number,
    mileage?: number,
    fuelType?: string,
    transmission?: string,
    condition?: string,
    numberOfDoors?: number
  ): void {
    if (brand !== undefined) this.brand = brand;
    if (model !== undefined) this.model = model;
    if (year !== undefined) this.year = year;
    if (color !== undefined) this.color = color;
    if (price !== undefined) this.price = price;
    if (mileage !== undefined) this.mileage = mileage;
    if (fuelType !== undefined) this.fuelType = fuelType;
    if (transmission !== undefined) this.transmission = transmission;
    if (condition !== undefined) this.condition = condition;
    if (numberOfDoors !== undefined) this.numberOfDoors = numberOfDoors;
    
    this.updatedAt = new Date();
    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      brand: this.brand,
      model: this.model,
      year: this.year,
      color: this.color,
      price: this.price,
      isSold: this.isSold,
      buyerCPF: this.buyerCPF,
      saleDate: this.saleDate,
      mileage: this.mileage,
      fuelType: this.fuelType,
      transmission: this.transmission,
      condition: this.condition,
      numberOfDoors: this.numberOfDoors,
      sellerId: this.sellerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 