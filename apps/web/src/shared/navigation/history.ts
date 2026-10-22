/**
 * 앱 안에서 이동한 기록의 위치를 history.state에 함께 저장한다.
 * 딥링크·푸시·새 탭으로 첫 화면에 들어오면 위치가 0이라, 헤더 뒤로가기를 홈 이동으로 바꿀 수 있다.
 * (history.length는 앱에 들어오기 전 기록까지 세고, WebView 첫 화면에서는 돌아갈 곳이 없다.)
 *
 * Next도 pushState/replaceState를 감싸지만 서로 이어서 호출하므로 감싸는 순서는 상관없다.
 */
const INDEX_KEY = "__morakIndex";

const currentIndex = (): number => window.history.state?.[INDEX_KEY] ?? 0;

if (typeof window !== "undefined") {
  const { pushState, replaceState } = window.history;
  window.history.pushState = function (data, unused, url) {
    return pushState.call(this, { ...data, [INDEX_KEY]: currentIndex() + 1 }, unused, url);
  };
  window.history.replaceState = function (data, unused, url) {
    return replaceState.call(this, { ...data, [INDEX_KEY]: currentIndex() }, unused, url);
  };
}

/** 앱 안에서 이동한 기록이 있어 router.back()으로 돌아갈 수 있는지 */
export const canGoBackInApp = () => currentIndex() > 0;
