import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env.local",
  )
}

// Convert string secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: "customer" | "provider" | "admin"
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  // Convert expires in to seconds
  const expiresInSeconds = JWT_EXPIRES_IN === "7d" ? 7 * 24 * 60 * 60 : parseInt(JWT_EXPIRES_IN)
  
  // Cast our payload to be compatible with jose's JWTPayload type
  const josePayload = payload as Record<string, any>
  
  return await new SignJWT(josePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'] // Ensure we use the same algorithm as jsonwebtoken
    })
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "customer" | "provider" | "admin"
    }
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    // Simple base64 decode of the payload part
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    return null
  }
}