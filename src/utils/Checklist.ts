export enum ChecklistMode {
  INCLUDE = 'include',
  EXCLUDE = 'exclude'
}

export interface ChecklistOptions {
  data: Array<string>;
  mode: ChecklistMode;
}

export class Checklist {
  protected data: Array<string>;
  protected mode: ChecklistMode;

  constructor(options: ChecklistOptions) {
    this.data = Array.from(options.data);
    this.mode = options.mode;
  }

  public check(value: string): boolean {
    if (this.mode === ChecklistMode.INCLUDE) {
      return this.data.includes(value);
    }

    if (this.mode === ChecklistMode.EXCLUDE) {
      return !this.data.includes(value);
    }

    return false;
  }
}
