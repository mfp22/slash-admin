import { useStore } from '@state-adapt/react';
import { Source } from '@state-adapt/rxjs';
import { tap } from 'rxjs';

import { adapt } from '@/state-adapt';
import { getItem, removeItem, setItem } from '@/utils/storage';

import { StorageEnum, ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

type State = {
  themeColorPresets: ThemeColorPresets;
  themeMode: ThemeMode;
  themeLayout: ThemeLayout;
  themeStretch: boolean;
};
const initialState: State = getItem<State>(StorageEnum.Settings) || {
  themeColorPresets: ThemeColorPresets.Default,
  themeMode: ThemeMode.Light,
  themeLayout: ThemeLayout.Vertical,
  themeStretch: false,
};

export const settingsChange$ = new Source<State>('settingsChange$');
export const settingsReset$ = new Source<void>('settingsReset$');

export const settingsStore = adapt(initialState, {
  sources: {
    set: settingsChange$.pipe(tap(({ payload }) => setItem(StorageEnum.Settings, payload))),
    reset: settingsReset$.pipe(tap(() => removeItem(StorageEnum.Settings))),
  },
});
settingsStore.state$.subscribe();

export const useSettings = () => useStore(settingsStore).state;
