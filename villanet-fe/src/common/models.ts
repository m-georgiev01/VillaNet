export interface Villa {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  image: string;
  ownerId: number;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export const roles = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Owner' },
];

export interface UpdateVillaRequest {
  name: string;
  description: string;
  pricePerNight: number;
}

export interface CreateVillaRequest extends UpdateVillaRequest {
  location: string;
  capacity: number;
  image: File | null;
}

export interface Reservation {
id: number;
propertyId: number;
propertyName: string;
startDate: string;
endDate: string;
totalNights: number;
totalPrice: number;
}

export const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ApiBaseUrl = "http://localhost:5168"
export const ApiEndpointsUrl = `${ApiBaseUrl}/api`;
export const MINIMUM_DAYS_BEFORE_CANCELLATION = 3;