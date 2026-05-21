export interface Review {
  bookingId: number;
  vendorId: string;
  vendorName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const KEY = "eg_reviews";

export function getReviews(): Review[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getReviewByBooking(bookingId: number): Review | undefined {
  return getReviews().find((r) => r.bookingId === bookingId);
}

export function saveReview(review: Review) {
  const all = getReviews().filter((r) => r.bookingId !== review.bookingId);
  all.push(review);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteReview(bookingId: number) {
  const all = getReviews().filter((r) => r.bookingId !== bookingId);
  localStorage.setItem(KEY, JSON.stringify(all));
}
