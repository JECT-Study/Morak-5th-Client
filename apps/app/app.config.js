/**
 * app.json을 그대로 쓰되, 안드로이드 푸시 설정 파일 경로만 빌드 환경에 맞게 고른다.
 * google-services.json은 git에 올리지 않아서 EAS 클라우드 빌드에는 없다.
 * EAS에서는 비밀 파일 변수 GOOGLE_SERVICES_JSON(파일 경로)을, 로컬에서는 app.json의 경로를 쓴다.
 * @param {{ config: import("expo/config").ExpoConfig }} context
 */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
