export interface AdminTokenPayload {
  id: string;
  type: string;
  jti: string;
  refreshJti: string;
}

export interface RefreshTokenPayload {
  id: string;
  jti: string;
}
