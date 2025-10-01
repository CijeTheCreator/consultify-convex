import { authClient } from './auth-client'

export async function signInWithEmail(email: string, password: string) {
  return await authClient.signIn.email({
    email,
    password
  })
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  return await authClient.signUp.email({
    email,
    password,
    name
  })
}