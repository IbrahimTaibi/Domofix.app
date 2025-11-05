import { z } from 'zod'

// Login form schema and types
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration form schema and types
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  role: z.enum(['customer', 'provider']),
  phoneNumber: z.string()
    .optional()
    .refine((val) => !val || /^\d{8,15}$/.test(val), 'Numéro de téléphone invalide'),
  countryCode: z.string()
    .optional()
    .refine((val) => !val || /^\+\d{1,4}$/.test(val), 'Code pays invalide (ex: +33)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>