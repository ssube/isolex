export enum FilterBehavior {
  Drop = 0,
  Allow = 1
}

export interface Filter {
  filter(): Promise<FilterBehavior>;
}