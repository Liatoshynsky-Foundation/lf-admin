export interface AdminTokenPayload {
  id: string;
  type: string;
  refreshJti: string;
}

export interface RefreshTokenPayload {
  id: string;
}
