# URUSmart Test Report

Generated at: 2026-08-10T07:48:36.402Z

## Summary

- Total test cases: 12
- Passed: 12
- Failed: 0

## Test Cases

| Test Case | Function | Scenario | Input | Expected | Actual | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TC01 | thaiDate.parseISOToDate | แปลงวันที่ ISO เป็น Date แบบ local time | 2024-10-26 | 2024-10-26 | 2024-10-26 | PASS |
| TC02 | thaiDate.toISODate | แปลง Date เป็นรูปแบบ YYYY-MM-DD สำหรับส่ง API | new Date(2024, 9, 26) | 2024-10-26 | 2024-10-26 | PASS |
| TC03 | thaiDate.formatThaiDate | แสดงวันที่เป็น พ.ศ. สำหรับผู้ใช้ | 2024-10-26 | 26/10/2567 | 26/10/2567 | PASS |
| TC04 | thaiDate.formatThaiDate | กรณี backend ส่งวันที่ว่างหรือ 0000-00-00 | 0000-00-00 | (empty) | (empty) | PASS |
| TC05 | image.fixPhotoUrl | แปลง path รูปจาก backend ให้เป็น URL เต็ม | /storage/photos/profile.jpg | https://api.example.test/storage/photos/profile.jpg | https://api.example.test/storage/photos/profile.jpg | PASS |
| TC06 | image.fixPhotoUrl | แปลง localhost URL ให้ device เปิดได้ผ่าน API base URL | http://localhost:8001/storage/photos/profile.jpg | https://api.example.test/storage/photos/profile.jpg | https://api.example.test/storage/photos/profile.jpg | PASS |
| TC07 | image.fixPhotoUrl | คงค่า external CDN URL เดิม | https://cdn.example.test/a.jpg | https://cdn.example.test/a.jpg | https://cdn.example.test/a.jpg | PASS |
| TC08 | name.stripNamePrefix | ตัดคำนำหน้าชื่อภาษาไทย | นางสาว สมใจ ทดสอบ | สมใจ ทดสอบ | สมใจ ทดสอบ | PASS |
| TC09 | name.stripNamePrefix | ตัดคำนำหน้าทางวิชาการ | ดร. ตัวอย่าง ทดสอบ | ตัวอย่าง ทดสอบ | ตัวอย่าง ทดสอบ | PASS |
| TC10 | expertFields.getExpertTitle | ดึงชื่อผลงานจาก field reference เมื่อไม่มี name/title | { reference: 'FTFY' } | FTFY | FTFY | PASS |
| TC11 | expertFields.getExpertLink | ดึงลิงก์เอกสารจาก file_url | { file_url: 'https://example.com/file.pdf' } | https://example.com/file.pdf | https://example.com/file.pdf | PASS |
| TC12 | expertFields.getExpertYear | ดึงปีของข้อมูล expert | { year: 2568 } | 2568 | 2568 | PASS |
