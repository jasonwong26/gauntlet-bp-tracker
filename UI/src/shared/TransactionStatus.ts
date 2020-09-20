
export enum TransactionState {
  INACTIVE = 0,
  PENDING = 1,
  SUCCESS = 2,
  ERRORED = 3
}

export interface TransactionStatus {
  state: TransactionState,
  isInactive: boolean,
  isPending: boolean,
  isComplete: boolean,
  isErrored: boolean,
  error?: string | Error
}

export const buildStatus = (state: TransactionState, error?: string | Error) => {
  const status: TransactionStatus = {
    state,
    isInactive: state === TransactionState.INACTIVE,
    isPending: state === TransactionState.PENDING,
    isComplete: state > TransactionState.PENDING,
    isErrored: state === TransactionState.ERRORED,
    error
  };
  
  return status;
};
