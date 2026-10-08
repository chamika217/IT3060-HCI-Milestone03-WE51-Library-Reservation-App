export type Book = { id: string; title: string; author: string; isbn: string; category: string; description: string; color: string; copies: number; available: boolean; cover?: number };
export type Reservation = Book & { reservationId: string; pickupDate: string; pickupWindow: string; pickupCode: string };
