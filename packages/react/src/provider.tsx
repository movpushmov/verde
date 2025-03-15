import type { Scope } from '@verde/core';
import type { ReactNode } from 'react';
import { createContext } from 'react';

export const Context = createContext<Scope | null>(null);

export function Provider(props: { scope: Scope; children: ReactNode }) {
  return (
    <Context.Provider value={props.scope}>{props.children}</Context.Provider>
  );
}
