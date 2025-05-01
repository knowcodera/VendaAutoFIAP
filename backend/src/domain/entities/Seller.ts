export class Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: Date;
  cpf: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender?: string;
    birthDate?: Date;
    cpf: string;
    zipCode?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.gender = props.gender;
    this.birthDate = props.birthDate;
    this.cpf = props.cpf;
    this.zipCode = props.zipCode;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      gender: this.gender,
      birthDate: this.birthDate,
      cpf: this.cpf,
      zipCode: this.zipCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 