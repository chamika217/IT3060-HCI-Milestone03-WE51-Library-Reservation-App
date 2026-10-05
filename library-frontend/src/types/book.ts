export type Book = { id: string; title: string; author: string; isbn: string; category: string; description: string; color: string; copies: number; available: boolean };
export type Reservation = Book & { reservationId: string; pickupDate: string; pickupWindow: string; pickupCode: string };
