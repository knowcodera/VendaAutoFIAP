export class VehicleImage {
  readonly id: number;
  readonly filename: string;
  readonly path: string;
  readonly url: string;
  readonly description?: string;
  readonly isPrimary: boolean;
  readonly vehicleId: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: number;
    filename: string;
    path: string;
    url: string;
    description?: string;
    isPrimary: boolean;
    vehicleId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.filename = props.filename;
    this.path = props.path;
    this.url = props.url;
    this.description = props.description;
    this.isPrimary = props.isPrimary;
    this.vehicleId = props.vehicleId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
} 