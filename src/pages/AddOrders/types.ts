export interface AdditionalStop {
  id: string;
  type: 'loading' | 'unloading' | 'customs';
  address: string;
  note: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  vehicleId: string;
  driverName: string;
  loadingDate: string;
  additionalStops: AdditionalStop[];
  isLocked: boolean;
}

export interface Consignee {
  id: string;
  name: string;
  note: string;
  contractorId?: number;
}