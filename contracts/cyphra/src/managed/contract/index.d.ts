import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  get_input_note_value(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  get_output_note_value(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  get_change_note_value(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>,
          amount_0: bigint,
          noteCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  confidentialTransfer(context: __compactRuntime.CircuitContext<PS>,
                       nullifier_0: Uint8Array,
                       newCommitment_0: Uint8Array,
                       changeCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                         requestId_0: Uint8Array,
                         requestCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        paymentNullifier_0: Uint8Array,
                        receiptCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  grantAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                     auditorKey_0: Uint8Array,
                     permissions_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      auditorKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>,
          amount_0: bigint,
          noteCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  confidentialTransfer(context: __compactRuntime.CircuitContext<PS>,
                       nullifier_0: Uint8Array,
                       newCommitment_0: Uint8Array,
                       changeCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                         requestId_0: Uint8Array,
                         requestCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        paymentNullifier_0: Uint8Array,
                        receiptCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  grantAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                     auditorKey_0: Uint8Array,
                     permissions_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      auditorKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>,
          amount_0: bigint,
          noteCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  confidentialTransfer(context: __compactRuntime.CircuitContext<PS>,
                       nullifier_0: Uint8Array,
                       newCommitment_0: Uint8Array,
                       changeCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                         requestId_0: Uint8Array,
                         requestCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  fulfillPaymentRequest(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        paymentNullifier_0: Uint8Array,
                        receiptCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  grantAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                     auditorKey_0: Uint8Array,
                     permissions_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditorAccess(context: __compactRuntime.CircuitContext<PS>,
                      auditorKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  commitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  paymentRequests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  paidRequests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  auditorRegistry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly totalShieldedDeposits: bigint;
  readonly totalConfidentialTransfers: bigint;
  readonly totalPaymentRequests: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
