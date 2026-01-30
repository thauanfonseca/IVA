
export interface MunicipalityData {
  name: string;
  iva2022: number;
  iva2023: number;
  ivaProvisorio2024: number;
  iva2024: number;
  variacaoDefinito2024: number;
  ipm2026: number;
  projecaoRepasse: number;
  contribuicaoTotal: number;
  incrementoIpm: number;
  honorariosMensal: number;
}

export interface SummaryStats {
  totalRepasse: number;
  mediaCrescimento: number;
  totalContribuicao: number;
  count: number;
}
