"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  email: string,
  password: string
): Promise<string | null> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
    return null;
  } catch (error) {
    // Re-throw Next.js redirect errors so the redirect happens
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof AuthError) {
      return "Email o contraseña incorrectos.";
    }
    return "Error al conectar con el servidor.";
  }
}
