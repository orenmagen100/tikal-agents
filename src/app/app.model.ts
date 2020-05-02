export interface ICountryAgent {
  name: string;
  agentsSet: Set<string>;
  isolatedAgentsSet: Set<string>;
}
export interface IAgent {
  agent: string;
  country: string;
  address: string;
  date: string;
}

