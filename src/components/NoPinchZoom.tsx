"use client";

import { useEffect } from "react";

/**
 * 앱 전반의 확대/축소를 차단한다. iOS Safari는 viewport의 user-scalable=no /
 * maximum-scale와 body의 touch-action:pan-x pan-y를 부분 무시해 핀치줌이 새어
 * 나가므로, 멀티터치 touchmove·Safari 제스처 이벤트·ctrl+휠을 다중으로 preventDefault.
 * 단, 이미지 뷰어(.touch-none, 자체 JS 줌/팬)는 항상 제외한다.
 * (참고: ai-companion 프로젝트의 zoom-guard 구현)
 */
function isInsideMediaViewer(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(".touch-none"));
}

export function NoPinchZoom() {
  useEffect(() => {
    // ① iOS 핀치 차단의 가장 신뢰도 높은 방법: 멀티터치 touchmove를 preventDefault.
    //    단일 터치(스크롤)는 절대 건드리지 않아 세로/가로 스크롤을 보존한다.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length < 2) return;
      if (isInsideMediaViewer(e.target)) return;
      e.preventDefault();
    };

    // ② Safari 전용 비표준 제스처 이벤트(중복 방어).
    const onGesture = (e: Event) => {
      if (isInsideMediaViewer(e.target)) return;
      e.preventDefault();
    };

    // ③ 데스크톱/트랙패드 확대(ctrl+휠) 차단.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      if (isInsideMediaViewer(e.target)) return;
      e.preventDefault();
    };

    const gestureEvents = ["gesturestart", "gesturechange", "gestureend"];
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("wheel", onWheel, { passive: false });
    for (const type of gestureEvents) {
      document.addEventListener(type, onGesture as EventListener, {
        passive: false,
      });
    }

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("wheel", onWheel);
      for (const type of gestureEvents) {
        document.removeEventListener(type, onGesture as EventListener);
      }
    };
  }, []);

  return null;
}
