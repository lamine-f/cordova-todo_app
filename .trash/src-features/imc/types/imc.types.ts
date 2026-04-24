export interface ImcInputs {
  height: string;
  weight: string;
}

export interface ImcState {
  height:   string | null;
  weight:   string | null;
  result:   number | null;
  category: string | null;
}
