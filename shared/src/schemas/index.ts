import { z } from 'zod';
import { ADDRESS_PREFIXES } from '../constants/index.js';

export const ShieldedAddressSchema = z
  .string()
  .min(30, 'Shielded address is too short')
  .max(120, 'Shielded address is too long')
  .regex(
    new RegExp(`^${ADDRESS_PREFIXES.SHIELDED}1[0-9a-z]+$`),
    'Invalid Midnight shielded address (must start with mn_shielded1)'
  );

export const UnshieldedAddressSchema = z
  .string()
  .min(30, 'Unshielded address is too short')
  .max(120, 'Unshielded address is too long')
  .regex(
    new RegExp(`^${ADDRESS_PREFIXES.UNSHIELDED}1[0-9a-z]+$`),
    'Invalid Midnight unshielded address (must start with mn_addr1)'
  );

export const AnyMidnightAddressSchema = z.string().refine(
  (addr) =>
    addr.startsWith(ADDRESS_PREFIXES.SHIELDED) ||
    addr.startsWith(ADDRESS_PREFIXES.UNSHIELDED),
  { message: 'Must be a valid Midnight shielded or unshielded address' }
);

export const TokenTypeSchema = z.enum(['NIGHT', 'DUST', 'tCYPHRA']);

export const CreatePaymentRequestSchema = z.object({
  recipientAddress: ShieldedAddressSchema,
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Amount must be a positive decimal or integer')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  tokenType: TokenTypeSchema,
  memo: z.string().max(256, 'Memo cannot exceed 256 characters').optional(),
  expiryHours: z.number().int().min(1).max(720).default(24),
});

export type CreatePaymentRequestInput = z.infer<typeof CreatePaymentRequestSchema>;

export const FulfillPaymentRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID format'),
  payerShieldedAddress: ShieldedAddressSchema,
  txHash: z.string().min(10, 'Invalid transaction hash'),
  paymentNullifier: z.string().length(64, 'Nullifier must be 32-byte hex (64 chars)'),
  receiptCommitment: z.string().length(64, 'Commitment must be 32-byte hex (64 chars)'),
});

export type FulfillPaymentRequestInput = z.infer<typeof FulfillPaymentRequestSchema>;

export const ConfidentialTransferSchema = z.object({
  recipientAddress: ShieldedAddressSchema,
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Amount must be a positive decimal or integer')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  tokenType: TokenTypeSchema,
  memo: z.string().max(256).optional(),
});

export type ConfidentialTransferInput = z.infer<typeof ConfidentialTransferSchema>;

export const GrantAuditorSchema = z.object({
  ownerShieldedAddress: ShieldedAddressSchema,
  auditorAddress: z.string().min(20),
  permissions: z.number().int().min(1).max(7),
  durationDays: z.number().int().min(1).max(365),
});

export type GrantAuditorInput = z.infer<typeof GrantAuditorSchema>;
