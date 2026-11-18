import NotificationList from "@/features/notification/components/notification-list";
import AppHeader from "@/shared/layout/app-header";

export default function NotificationsPage() {
  return (
    <>
      <AppHeader nested title="알림" />
      <NotificationList />
    </>
  );
}
