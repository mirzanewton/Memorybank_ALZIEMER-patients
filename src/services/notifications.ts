import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleReminder(title: string, detail: string, time: string): Promise<string | undefined> {
  const parsed = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!parsed) throw new Error('Enter the time in 24-hour format, such as 08:30.');
  const hour = Number(parsed[1]);
  const minute = Number(parsed[2]);
  if (hour > 23 || minute > 59) throw new Error('Enter a valid time between 00:00 and 23:59.');

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return undefined;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Medication reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return Notifications.scheduleNotificationAsync({
    content: { title: `Medication reminder: ${title}`, body: detail || 'Please check the medication schedule confirmed by your caregiver.' },
    trigger: { hour, minute, repeats: true, channelId: 'medication-reminders' },
  });
}

export async function cancelReminder(notificationId?: string | null): Promise<void> {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
