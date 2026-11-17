import { Settings } from "lucide-react";
import Link from "next/link";

import AppHeader from "@/shared/layout/app-header";
import ScreenPlaceholder from "@/shared/layout/screen-placeholder";
import { IconButton } from "@/shared/ui/icon-button";

export default function MyPage() {
  return (
    <>
      <AppHeader
        title="마이페이지"
        suffixAction={
          <IconButton asChild aria-label="설정">
            <Link href="/settings">
              <Settings aria-hidden />
            </Link>
          </IconButton>
        }
      />
      <ScreenPlaceholder name="마이페이지" />
    </>
  );
}
