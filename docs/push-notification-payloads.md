# Push Notification Payloads

System notification banners are rendered by iOS and Android. Keep the title
short, put the useful detail in the body, and use `data` only for navigation.

## Expo payload

```json
{
  "to": "ExponentPushToken[xxxx]",
  "title": "ประกาศมหาวิทยาลัย",
  "body": "งดการเรียนการสอนภาคบ่าย วันที่ 8 กรกฎาคม",
  "sound": "default",
  "priority": "high",
  "channelId": "announcements",
  "data": {
    "type": "announcement",
    "announcement_id": 123,
    "screen": "Announcements"
  }
}
```

## Android channels

| Notification type | `channelId` | Example title |
| --- | --- | --- |
| Announcement | `announcements` | `ประกาศมหาวิทยาลัย` |
| Before class | `reminders` | `อีก 15 นาทีมีการสอน` |
| Grade deadline | `reminders` | `ใกล้ครบกำหนดส่งเกรด` |
| Holiday | `updates` | `แจ้งวันหยุดราชการ` |
| Fallback | `default` | `การแจ้งเตือน` |

Use one clear action per notification. Avoid repeating the app name in the
title because the operating system already displays it. Keep `title` around
40 characters and `body` around 120 characters so important text is not cut
off. The backend remains responsible for checking each user's notification
settings before sending.
