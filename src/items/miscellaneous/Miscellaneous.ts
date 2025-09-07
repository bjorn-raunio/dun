import { Item } from '../base';

export class Miscellaneous extends Item {
  kind: "miscellaneous" = "miscellaneous";

  constructor(params: {
    id?: string;
    name: string;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
  }
}
