import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lista: undefined;
  Publicar: undefined;
  Notificacoes: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  PromotionDetail: { promotionId: string };
  Ranking: undefined;
  HistoricoConfirmacoes: undefined;
  ItensSalvos: undefined;
  MinhasPromocoes: undefined;
  EditarPerfil: undefined;
  Privacidade: undefined;
  Seguranca: undefined;
  ComoFunciona: undefined;
  RegrasComunidade: undefined;
  AjudaSuporte: undefined;
  TermosUso: undefined;
  PoliticaPrivacidade: undefined;
};

// Telas dentro das abas precisam navegar para rotas do stack pai (PromotionDetail, Ranking).
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
