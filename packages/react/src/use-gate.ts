import type { Gate } from '@verde/core';
import { useUnit } from './use-unit';
import { useEffect } from 'react';

export function useGate<T>(gate: Gate<T>, payload: T) {
  const { onClose, onOpen } = useUnit({
    onOpen: gate.open,
    onClose: gate.close,
  });

  useEffect(() => {
    onOpen(payload);
  }, [payload]);

  useEffect(() => onClose, []);
}
