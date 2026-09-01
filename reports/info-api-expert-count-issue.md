# รายงานปัญหา Info API: Expert menu counts และการบันทึกข้อมูล

เรียนทีม Backend

## อาการที่พบ

หน้า “ระบบฐานข้อมูลผู้เชี่ยวชาญ” แสดงเครื่องหมาย `—` ในช่องจำนวนข้อมูลของหลายเมนู เช่น ประวัติการบริหาร, ผลงานวิจัยบางประเภท, proceeding, หนังสือ, สิทธิบัตร, รางวัล, วิทยากร, การฝึกอบรม, บริการวิชาการ และผลงานด้านมนุษย์

หมายเหตุ: `—` ในหน้าแอปหมายถึง frontend เรียก API ไม่สำเร็จและได้รับค่า count เป็น `null` ไม่ได้หมายถึงจำนวนข้อมูลเท่ากับศูนย์ (`0` จะแสดงเป็นเลข 0)

จากภาพล่าสุดพบว่า `ความสนใจ = 1`, `ผลงานวิจัย = 0` และ `Journal = 0` แสดงผลได้ปกติ ขณะที่รายการต่อไปนี้ยังแสดง `—`:

```text
ประวัติการบริหาร (boardexes)
ความเชี่ยวชาญ (expertises)
Proceeding (proceedings)
หนังสือ (books)
สิทธิบัตร (patents)
รางวัล (awards)
วิทยากร (lecturers)
ฝึกอบรม/ศึกษาดูงาน (trainings)
บริการวิชาการ/พันธกิจสัมพันธ์ (academics)
มนุษย์ (hsps)
```

จึงสรุปได้ว่า token และการเชื่อมต่อ Info API ใช้งานได้บางส่วน ปัญหาเหลืออยู่เป็นราย resource ไม่ใช่ปัญหา BASE URL หรือการ login ทั้งระบบ

## วิธีทำให้เกิดปัญหา

1. Login เข้าแอปด้วยบัญชีที่มีสิทธิ์ใช้งาน Expert
2. เปิดหน้า “ระบบฐานข้อมูลผู้เชี่ยวชาญ”
3. สังเกต count ของเมนู Expert ที่เป็น `—`
4. เปิด “ประวัติการบริหาร” กรอกข้อมูล แล้วกด “เพิ่มข้อมูลประวัติการบริหาร”
5. ระบบแสดง alert `บันทึกไม่สำเร็จ` พร้อมข้อความ `Expert boardexes owner column is not available.`

หน้า dashboard เรียก count ด้วย `GET` และใช้ Bearer token เดียวกับการบันทึกข้อมูล

## Error ที่ยืนยันได้

> สถานะปัญหาเดิม (ก่อน deploy fix): production ตอบ error นี้ใน `POST /info/expert/boardexes` และ route `/info/expert/expertises` เคยตอบ `404`

เมื่อบันทึกประวัติการบริหารจากหน้า Expert ได้ response:

```text
Expert boardexes owner column is not available.
```

Request ที่ส่ง:

```http
POST https://info.uru.ac.th/server/api/info/expert/boardexes
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

```json
{
  "position": "...",
  "workplace": "...",
  "year_start": "2569",
  "year_end": "2566"
}
```

Frontend ไม่ได้ส่ง `citizen_id`, `id_card` หรือ `owner` ตามข้อกำหนดความปลอดภัย โดยคาดหวังให้ Info API ระบุเจ้าของข้อมูลจาก Bearer token

## สถานะล่าสุดหลัง Backend deploy fix

Backend แจ้งว่า deploy แล้ว:

- เพิ่ม CRUD route `/info/expert/expertises`
- แก้ owner resolver ให้รองรับ `id_card`, `user_id` และ `users_id`
- แก้ไฟล์ `routes/api.php`, `InfoBridgeController.php` และ `CanonicalExpertiseGroups.php`

ผลตรวจแบบไม่ส่ง token หลัง deploy: endpoint ทั้งหมดตอบ `401` แทน `404` ซึ่งยืนยันว่า route มีอยู่และ auth ทำงานถูกต้อง

### สถานะล่าสุดที่ยืนยันเพิ่มเติม

Backend แจ้งว่าอัปโหลด `InfoBridgeController.php` ไปยัง production สำเร็จแล้ว และตรวจ endpoint ต่อไปนี้หลังอัปโหลด พบว่าเมื่อไม่ส่ง token ทุกเส้นตอบ `401` ตามที่คาดหวัง:

```text
/info/expert/expertises
/info/expert/boardexes
/info/expert/ref/degrees
/info/expert/ref/search-options
```

Frontend ตั้งค่า base URL เป็น `https://info.uru.ac.th/server/api` แล้ว และพร้อมทดสอบด้วย Bearer token เดิมจาก URU Smart login

## Endpoint ที่ต้องยืนยันด้วย Bearer token จริง

Frontend ขอให้ทดสอบด้วย token จริงจาก mobile login:

```text
/info/expert/expertises
/info/expert/boardexes
/info/expert/proceedings
/info/expert/books
/info/expert/patents
/info/expert/awards
/info/expert/lecturers
/info/expert/trainings
/info/expert/academics
/info/expert/hsps
```

คาดหวังให้ `GET` ทุก endpoint ได้ `200` พร้อม `{ "data": [] }` หากยังไม่มีข้อมูล และตรวจ `POST`, `PUT/PATCH`, `DELETE` ตามที่ route รองรับ โดยเฉพาะ:

```text
/info/expert/boardexes
```

## ผลลัพธ์ที่ต้องยืนยัน

รบกวนยืนยันผลด้วย token จริงเป็นตาราง โดยระบุ:

```text
endpoint | method | HTTP status | response body/message | schema/table ที่ใช้ | owner field ที่ใช้
```

สำหรับ `boardexes` ให้ทดสอบสร้างข้อมูลด้วย payload เดิม และคาดหวัง `201` พร้อม record ที่สร้างใหม่ หากยังพบ `owner column is not available` ให้ตรวจ production code/schema ที่ใช้งานจริงอีกครั้ง

ตรวจสอบเป็นพิเศษว่าแต่ละ resource มี:

1. ตาราง/column สำหรับผูกเจ้าของข้อมูลกับ user หรือ citizen_id
2. Model/Resource mapping ของ owner ถูกต้อง
3. GET สามารถอ่านข้อมูลของ user จาก token ได้
4. POST สามารถสร้างข้อมูลโดยไม่ต้องให้ frontend ส่ง owner เองได้
5. กรณีไม่มีตารางหรือ schema ให้ตอบ status/message ที่สอดคล้องกัน เช่น `501` พร้อมรายละเอียดที่ชัดเจน

## Expected behavior

- มีข้อมูล: ตอบ `200` พร้อม array หรือ pagination data
- ไม่มีข้อมูล: ตอบ `200` พร้อม array ว่าง และ frontend จะแสดง `0`
- token ไม่ถูกต้อง: ตอบ `401`
- schema/module ยังไม่พร้อม: ตอบ `501` พร้อมชื่อ resource ที่มีปัญหา
- ไม่ควรตอบ error `owner column is not available` หาก route ถูก deploy พร้อม schema ที่ใช้งานจริง

หลังทดสอบ token จริงแล้ว หาก endpoint ใดยังตอบ error ขอรายละเอียด status, response body, schema/table และ owner field ที่ใช้งานจริง เพื่อแก้ไขต่อครับ

## รายการตรวจสอบ Frontend และสิ่งที่ขอให้ Backend ยืนยัน

ตารางนี้สรุปจุดที่ Frontend เรียกใช้งานจริง ขอให้ตรวจสอบ endpoint, รูปแบบ response, schema และ owner mapping ให้ตรงตามรายการ

### ข้อเท็จจริงจาก SQL dump `expert2 (1).sql`

SQL dump ที่ได้รับระบุว่า resource legacy ส่วนใหญ่ผูก owner ด้วย `id_card` โดยตรง ดังนั้น Info API ควรอ่าน `citizen_id` จาก Bearer token แล้วใช้เป็น `id_card` ใน query/insert/update/delete โดยไม่รับ owner จาก Frontend

| Resource API | ตารางจริงใน SQL dump | owner field |
|---|---|---|
| `educations` | `education` | `id_card` |
| `workexes` | `workex` | `id_card` |
| `boardexes` | `boardex` | `id_card` |
| `interests` | `has_interest` | `id_card` |
| `researches` | `has_research` | `id_card` |
| `journals` | `has_journal` | `id_card` |
| `proceedings` | `has_proceeding` | `id_card` |
| `books` | `has_book` | `id_card` |
| `patents` | `has_patent` | `id_card` |
| `awards` | `has_award` | `id_card` |
| `lecturers` | `has_lecturer` | `id_card` |
| `trainings` | `has_training` | `id_card` |
| `academics` | `has_academic` | `id_card` |
| `hsps` | `has_hsps` | `id_card` |

หมายเหตุ: dump นี้ไม่พบตาราง `users_expert` หรือ `has_experts`; พบ `users.expert_id` และ master table `has_expert(expert_id, name)` แทน จึงขอให้ Backend ยืนยัน mapping ของ `/info/expert/expertises` บน production ว่าใช้ schema ใดจริง

### รายการที่ยังแสดง `—`: การศึกษาและความเชี่ยวชาญ

#### `GET /info/expert/educations`

SQL dump มีตาราง `education` ชัดเจน โดยใช้:

```text
id, id_card, degree, course, university, year, dateAdd
```

Backend ต้อง query ด้วย `education.id_card = citizen_id จาก token` และตอบ `200 { "data": [] }` เมื่อผู้ใช้ยังไม่มีข้อมูล ไม่ใช่ error. นอกจากนี้ `dateAdd` เป็น field บังคับใน schema จึงต้องให้ Backend กำหนดค่าขณะสร้างข้อมูล

#### `GET /info/expert/expertises`

SQL dump นี้ไม่พบ `users_expert` หรือ `has_experts` ตาม mapping ที่แจ้งก่อนหน้า แต่พบ:

```text
users.users_id
users.id_card
users.expert_id
has_expert.expert_id
has_expert.name
```

ดังนั้น Backend ต้องยืนยัน schema production ที่ใช้จริง และ implement endpoint ให้คืนรายการในรูปแบบที่ Frontend ใช้:

```json
{
  "data": [
    { "id": 6, "group_id": 6, "name": "กลุ่มวิศวกรรมศาสตร์" }
  ]
}
```

หาก production ใช้ schema เดียวกับ SQL dump นี้ ความเชี่ยวชาญของผู้ใช้ต้องอ่านจาก `users.expert_id` แล้ว join `has_expert.expert_id`; หากต้องรองรับหลายความเชี่ยวชาญ ต้องยืนยันว่ามีตาราง relation เพิ่มเติมใน production และแจ้งชื่อ table/columns ให้ชัดเจน

| ไฟล์ | การอ่านข้อมูล/Dropdown | การบันทึกข้อมูลที่ส่ง | สิ่งที่ Backend ต้องยืนยัน |
|---|---|---|---|
| `src/screens/expert/ExpertHome.js` + `ResearchList.js` | `GET /info/expert/profile-search` พร้อม search/pagination params | ไม่มี | รองรับ `limit`, `page`, `per_page`, `search_by`, `keyword`, `group_id`, `expertise_group_id`, `interest_id` และ response ทั้ง array กับ `{data, meta}` |
| `src/screens/expert/forms/ExpertiseForm.js` | `GET /info/expert/expertise-groups` | `group_id`, `name` | `group_id` ต้องตรงกับ master group และ GET/POST/PUT/PATCH/DELETE ต้องผูก owner จาก token |
| `src/screens/expert/forms/InterestForm.js` | `GET /info/expert/ref/search-options` | `name` | response ต้องมีรายการ interests พร้อม `id` และชื่อ (`name`/`label`) |
| `src/screens/expert/profile/EducationForm.js` | ปีเป็น local list; degree ปัจจุบันเป็นตัวเลือก hardcode 1–4 | `degree`, `course`, `university`, `year` | ยืนยัน ID/ชื่อของ degree จาก `/info/expert/ref/degrees`; หาก master มีมากกว่า 4 รายการต้องให้ Frontend เปลี่ยนมาโหลด endpoint นี้ |
| `src/screens/expert/forms/ResearchForm.js` | `GET /info/expert/ref/research-types`, `/research-levels`, `/research-pmu-types` | `name`, `year`, `research_type_id`, `research_PMU_type_id`, `research_level_id` | ชื่อ/ID ของ ref ต้องสอดคล้อง และรองรับตัวพิมพ์ `research_PMU_type_id` ตาม payload |
| `src/screens/expert/forms/JournalForm.js` | `GET /info/expert/ref/journal-types` | `name`, `year`, `journal_type_id`, `url` | response ของ journal type ต้องมี ID และชื่อที่แสดงได้ |
| `src/screens/expert/profile/WorkHistoryForm.js` | ปีเป็น local list | `position`, `workplace`, `year_start`, `year_end` | owner resolver และ validation ปีต้องทำงาน |
| `src/screens/expert/profile/AdminHistoryForm.js` | ปีเป็น local list | `position`, `workplace`, `year_start`, `year_end` | แก้/ยืนยัน `boardexes owner column` และคาดหวัง POST `201` |
| `src/screens/expert/forms/BookForm.js` | ปีเป็น local list | `name`, `year` | `books` ต้องมี owner mapping |
| `src/screens/expert/forms/ProceedingForm.js` | ปีเป็น local list | `year`, `name`, `reference`, `title`, `url` | `proceedings` ต้องมี owner mapping และรองรับ fields เหล่านี้ |
| `src/screens/expert/forms/PatentForm.js` | ปีเป็น local list | `year`, `name`, `link` | `patents` ต้องมี owner mapping และ validation ตาม schema |
| `src/screens/expert/forms/AwardForm.js` | ปีเป็น local list | `name`, `year` | `awards` ต้องมี owner mapping |
| `src/screens/expert/forms/SpeakerForm.js` | ปีเป็น local list | `name`, `year` | `lecturers` ต้องมี owner mapping |
| `src/screens/expert/forms/TrainingForm.js` | ปีเป็น local list | `name`, `year` | `trainings` ต้องมี owner mapping |
| `src/screens/expert/forms/ServiceForm.js` | ปีเป็น local list | `year`, `name`, `link`, `picture: ""` ตอนสร้าง | `has_academic.picture` เป็น `NOT NULL`; Backend ต้องรองรับค่าว่างและเติม `dateAdd` |
| `src/screens/expert/forms/HumanSubjectsForm.js` | ปีเป็น local list | `year`, `name`, `link` | `hsps` ต้องมี owner mapping และ validation ตาม schema |
| `src/hook/useRefs.js` | โหลด ref 6 endpoint ของ Info API | ไม่มี | ทุก endpoint ต้องตอบ `200` และ array โดยใช้ field ID/ชื่อที่ชัดเจน |
| `src/hook/useResource.js` | GET resource และ refresh หลัง mutation | CRUD ทุก resource | รองรับ `POST + _method` และคืน response รูปแบบคงที่ |
| `src/hook/useMenuCounts.js` | GET resource เพื่อคำนวณ count | ไม่มี | ไม่มีข้อมูลต้องตอบ `200 {data: []}` ไม่ใช่ error เพื่อให้แสดง `0` |
| `src/screens/expert/ProfileDetail.js` | `GET /info/expert/profile/{id}` + ref data | ไม่มี | response ต้องรวม relationships ที่ใช้แสดงรายละเอียด |
| `src/screens/expert/profile/ProfileForm.js` | positions/lines/main-units/sub-units จาก Info API; prefix ปัจจุบันเป็น TextInput | `/me`, `/me/photo` ยังเป็น URU Smart ตามข้อกำหนด | ยืนยัน response fields ของ ref profile, ตรวจ `/info/expert/ref/prefixes` ว่าควรใช้แทน TextInput หรือไม่ และคง `/me` endpoints เดิม |

### สิ่งที่ขอจาก Backend เพิ่มสำหรับ dropdown

สำหรับ endpoint ref ทุกตัว ขอระบุชื่อ field จริงของรายการ เช่น `id`, `name`, `name_th`, `name_en`, `*_id`, `*_name` และส่งตัวอย่าง response จริง 1 รายการต่อ endpoint เพราะหากชื่อ field ไม่ตรง แม้ HTTP `200` แล้ว dropdown จะยังว่างได้

หมายเหตุเพิ่มเติมเกี่ยวกับ dropdown ที่อาจทำให้ข้อมูลดูเหมือนหาย:

- `EducationForm` ยังใช้รายการ degree แบบ hardcode จึงอาจไม่ตรงกับ master data ของ Backend
- `ProfileForm` ยังรับ prefix เป็นข้อความ ไม่ได้ใช้ `/info/expert/ref/prefixes`
- ตัวเลือกปีในทุกฟอร์มเป็นรายการ local ไม่ได้โหลดจาก API
- ตัวเลือกค้นหา `search_by` ใน `ExpertHome` เป็นรายการ local ส่วนกลุ่มความเชี่ยวชาญและความสนใจโหลดจาก Info API

### ผลการทดสอบที่ขอจาก Backend

กรุณาทดสอบด้วย Bearer token จริงจาก mobile login และส่งผลในรูปแบบนี้:

```text
endpoint | method | HTTP status | response ตัวอย่าง | schema/table | owner field | หมายเหตุ
```

ต้องทดสอบอย่างน้อย:

- GET ทุก resource เพื่อยืนยันว่าโหลดรายการและ menu count ได้
- POST เพื่อยืนยันการเพิ่มข้อมูล
- PUT/PATCH เพื่อยืนยันการแก้ไขข้อมูล
- DELETE เพื่อยืนยันการลบข้อมูล
- reference endpoint ทุกตัว เพื่อยืนยันว่า dropdown มีรายการและชื่อแสดงผลถูกต้อง

กรณีไม่มีข้อมูล ให้ตอบ `200` พร้อม `{ "data": [] }` เพื่อให้ Frontend แสดงจำนวน `0` ไม่ใช่ `—`
