import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export default function useAutoReply(driveModeActive) {

  const [blockedMessages, setBlockedMessages] = useState([]);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [replyMessage, setReplyMessage] = useState(
    "I'm driving right now 🚗 and using DriveZen for safety. I'll reply when I arrive!"
  );
  const [blockedCount, setBlockedCount] = useState(0);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const notificationListener = useRef(null);

  const handleIncomingNotification = useCallback((notification) => {
    const { title, body } = notification.request.content;
    const sender = title || 'Unknown';
    const message = body || '';

    const blockedMsg = {
      id: Date.now().toString(),
      sender,
      message,
      time: new Date().toLocaleTimeString(),
      replied: false,
    };

    setBlockedMessages(prev => [blockedMsg, ...prev.slice(0, 19)]);
    setBlockedCount(prev => prev + 1);
  }, [autoReplyEnabled, replyMessage]);

  useEffect(() => {
    if (driveModeActive) {
      console.log('📵 Drive Mode ON — message blocking active');
      notificationListener.current =
        Notifications.addNotificationReceivedListener(handleIncomingNotification);
      showDriveModeNotification();
    } else {
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
        console.log('📳 Drive Mode OFF — notifications restored');
      }
      dismissDriveModeNotification();
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, [driveModeActive]);

  const showDriveModeNotification = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛡️ DriveZen Drive Mode Active',
        body: 'Notifications muted. Auto-reply enabled. Stay safe!',
      },
      trigger: null,
    });
  };

  const dismissDriveModeNotification = async () => {
    await Notifications.dismissAllNotificationsAsync();
  };

  const sendSMSReply = useCallback(async (phoneNumber) => {
    console.log('SMS reply queued for:', phoneNumber);
    return false;
  }, [replyMessage]);

  const clearBlockedMessages = useCallback(() => {
    setBlockedMessages([]);
    setBlockedCount(0);
  }, []);

  const markAllReplied = useCallback(() => {
    setBlockedMessages(prev =>
      prev.map(msg => ({ ...msg, replied: true }))
    );
  }, []);

  return {
    blockedMessages,
    blockedCount,
    autoReplyEnabled,
    setAutoReplyEnabled,
    replyMessage,
    setReplyMessage,
    smsAvailable,
    sendSMSReply,
    clearBlockedMessages,
    markAllReplied,
  };
}