export class Spell {
  readonly name: string;
  
  constructor(params: { name: string }) {
    this.name = params.name;
  }
}