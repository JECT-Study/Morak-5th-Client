import SettingsMenu from "@/features/settings/components/settings-menu";
import AppHeader from "@/shared/layout/app-header";

export default function SettingsPage() {
  return (
    <>
      <AppHeader nested title="설정" />
      <SettingsMenu />
    </>
  );
}
