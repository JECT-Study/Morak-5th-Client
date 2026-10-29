import type { SVGProps } from "react";

/**
 * Figma JDS 라이브러리의 circle-check 아이콘(Iconography/Function).
 * @jects/jds 0.8.0에 없어 Figma에서 SVG를 가져왔다. 패키지에 추가되면 <Icon name="circle-check" />로 바꾼다.
 * JDS 아이콘처럼 크기는 1em, 색은 currentColor를 따른다.
 */
export default function CircleCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M15.293 8.29285C15.6835 7.90232 16.3165 7.90232 16.707 8.29285C17.0976 8.68337 17.0976 9.31639 16.707 9.70691L11.207 15.2069C10.8165 15.5974 10.1835 15.5974 9.79297 15.2069L7.29297 12.7069C6.90244 12.3164 6.90244 11.6834 7.29297 11.2928C7.68349 10.9023 8.31651 10.9023 8.70703 11.2928L10.5 13.0858L15.293 8.29285Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0.999878C18.0751 0.999878 23 5.92475 23 11.9999C23 18.075 18.0751 22.9999 12 22.9999C5.92487 22.9999 1 18.075 1 11.9999C1 5.92475 5.92487 0.999878 12 0.999878ZM12 2.99988C7.02944 2.99988 3 7.02931 3 11.9999C3 16.9704 7.02944 20.9999 12 20.9999C16.9706 20.9999 21 16.9704 21 11.9999C21 7.02931 16.9706 2.99988 12 2.99988Z"
      />
    </svg>
  );
}
