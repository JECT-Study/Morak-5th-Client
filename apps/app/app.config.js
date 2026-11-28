/**
 * app.json을 그대로 쓰되, 빌드 환경에 따라 달라지는 값만 바꾼다.
 * - 안드로이드 푸시 설정 파일 경로: google-services.json은 git에 올리지 않아서 EAS 클라우드 빌드에는 없다.
 *   EAS에서는 비밀 파일 변수 GOOGLE_SERVICES_JSON(파일 경로)을, 로컬에서는 app.json의 경로를 쓴다.
 * - AdMob 앱 ID: 실제 ID는 저장소에 두지 않는다. 빌드 환경변수 ADMOB_ANDROID_APP_ID·ADMOB_IOS_APP_ID로 넣고,
 *   없으면 app.json의 구글 테스트 앱 ID를 쓴다.
 * @param {{ config: import("expo/config").ExpoConfig }} context
 */
const ADMOB_PLUGIN = "react-native-google-mobile-ads";

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
  plugins: config.plugins?.map((plugin) => {
    if (!Array.isArray(plugin) || plugin[0] !== ADMOB_PLUGIN) return plugin;
    return [
      ADMOB_PLUGIN,
      {
        ...plugin[1],
        androidAppId: process.env.ADMOB_ANDROID_APP_ID || plugin[1]?.androidAppId,
        iosAppId: process.env.ADMOB_IOS_APP_ID || plugin[1]?.iosAppId,
      },
    ];
  }),
});
