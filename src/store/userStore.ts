import { useStore } from '@state-adapt/react';
import { Source } from '@state-adapt/rxjs';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { tap } from 'rxjs';

import userService, { SignInReq } from '@/api/services/userService';
import { adapt } from '@/state-adapt';
import { getItem, removeItem, setItem } from '@/utils/storage';

import { UserInfo, UserToken } from '#/entity';
import { StorageEnum } from '#/enum';

type State = {
  userInfo: Partial<UserInfo>;
  userToken: UserToken;
};
const initialState: State = {
  userInfo: getItem<UserInfo>(StorageEnum.User) || {},
  userToken: getItem<UserToken>(StorageEnum.Token) || {},
};

export const userSuccess$ = new Source<State>('userSuccess$');
export const userReset$ = new Source<void>('userReset$');

export const userStore = adapt(initialState, {
  sources: {
    set: userSuccess$.pipe(
      tap(({ payload }) => {
        setItem(StorageEnum.User, payload.userInfo);
        setItem(StorageEnum.Token, payload.userToken);
      }),
    ),
    reset: userReset$.pipe(
      tap(() => {
        removeItem(StorageEnum.User);
        removeItem(StorageEnum.Token);
      }),
    ),
  },
});
userStore.state$.subscribe();

export const useUserInfo = () => useStore(userStore).state.userInfo;
export const useUserToken = () => useStore(userStore).state.userToken;

export const useSignIn = () => {
  const { t } = useTranslation();
  const navigatge = useNavigate();
  const { notification, message } = App.useApp();

  const signInMutation = useMutation(userService.signin);

  const signIn = async (data: SignInReq) => {
    try {
      const res = await signInMutation.mutateAsync(data);
      const { user, accessToken, refreshToken } = res;
      userSuccess$.next({ userInfo: user, userToken: { accessToken, refreshToken } });
      navigatge('/dashboard', { replace: true });

      notification.success({
        message: t('sys.login.loginSuccessTitle'),
        description: `${t('sys.login.loginSuccessDesc')}: ${data.username}`,
        duration: 3,
      });
    } catch (err) {
      message.warning({
        content: err.message,
        duration: 3,
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(signIn, []);
};
