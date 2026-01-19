import Constants from "expo-constants";

const getDevServerHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  return host || null;
};

const getJudgeBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_JUDGE_API_URL) {
    return process.env.EXPO_PUBLIC_JUDGE_API_URL;
  }
  const host = getDevServerHost();
  return host ? `http://${host}:4000` : "http://localhost:4000";
};

const JUDGE_API_URL = getJudgeBaseUrl();



