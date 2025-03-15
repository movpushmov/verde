import { Scope } from '@verde/core';
import { useContext } from 'react';
import { Context } from './provider';

export function useScope(): Scope {
  const scope = useContext(Context);

  if (!scope) {
    throw '[useScope] Scope is not provided. Insert "Provider" at root of your app.';
  }

  return scope;
}
