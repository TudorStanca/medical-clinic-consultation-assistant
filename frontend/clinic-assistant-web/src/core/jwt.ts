import { jwtDecode } from "jwt-decode";

interface RawJwtPayload {
  sub?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  email?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
}

export interface DecodedToken {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = jwtDecode<RawJwtPayload>(token);

    const userId =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      payload.sub ??
      "";

    const email =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
      payload.email ??
      "";

    const firstName =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] ??
      payload.given_name ??
      "";

    const lastName =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] ??
      payload.family_name ??
      "";

    const rawRole =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(rawRole) ? rawRole : rawRole ? [rawRole] : [];

    const exp = payload.exp ?? 0;

    return { userId, email, firstName, lastName, roles, exp };
  } catch {
    return null;
  }
}

export function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 < Date.now();
}
