import { Model, ModelFactory, ModelShape } from './types';
import { ctx } from './utils';

export function createModel<Params, State extends ModelShape>(
  modelFactory: ModelFactory<Params, State>,
): Model<Params, State> {
  return (params: Params) => ctx.defineModel(modelFactory, params);
}
