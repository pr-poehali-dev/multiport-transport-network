export interface AdditionalStop {
  id: string;
  type: 'loading' | 'unloading';
  address: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  vehicleId: string;
  additionalStops: AdditionalStop[];
  isLocked: boolean;
}

export interface Consignee {
  id: string;
  name: string;
  note: string;
  contractorId?: number;
}
