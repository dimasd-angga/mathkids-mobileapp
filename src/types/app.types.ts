export interface AppState {
  isFailedFetch: boolean;
  failedFetch: {
    message: string;
    menu: string;
  } | null;
}
