
export enum TransactionState {
  INACTIVE = 0,
  PENDING = 1,
  SUCCESS = 2,
  ERRORED = 3
}

export interface TransactionStatus {
  state: TransactionState,
  error?: string | Error
}

export const buildStatus = (state: TransactionState, error?: string | Error) => {
  const status: TransactionStatus = {
    state,
    error
  }
  return status;
};
