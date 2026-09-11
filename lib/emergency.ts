// เบอร์โทรฉุกเฉินตาม spec/modules/07-emergency.md — static content ต้องอัปเดตด้วยมือถ้าเบอร์เปลี่ยน
export type EmergencyContact = { number: string; label: string };
export type EmergencyGroup = { title: string; contacts: EmergencyContact[] };

/** เบอร์เด่นสุด แสดงเป็นปุ่มใหญ่ใน alert banner ก่อนรายการกลุ่มอื่น */
export const criticalContacts: EmergencyContact[] = [
  { number: "191", label: "ตำรวจ/เหตุด่วน" },
  { number: "199", label: "ไฟไหม้/กู้ภัย" },
  { number: "1669", label: "การแพทย์ฉุกเฉิน" },
];

export const emergencyGroups: EmergencyGroup[] = [
  {
    title: "รถพยาบาล / กู้ชีพเพิ่มเติม",
    contacts: [
      { number: "1646", label: "ศูนย์เอราวัณ (กรุงเทพฯ)" },
      { number: "1554", label: "หน่วยแพทย์กู้ชีวิต วชิรพยาบาล" },
      { number: "1691", label: "โรงพยาบาลตำรวจ" },
      { number: "1418", label: "มูลนิธิป่อเต็กตึ๊ง (กรุงเทพฯ)" },
      { number: "1677", label: "มูลนิธิร่วมกตัญญู" },
    ],
  },
  {
    title: "ตำรวจ / ทางหลวง / นักท่องเที่ยว",
    contacts: [
      { number: "1193", label: "ตำรวจทางหลวง" },
      { number: "1155", label: "ตำรวจท่องเที่ยว (Tourist Police)" },
      { number: "1192", label: "ศูนย์ปราบปรามการโจรกรรมรถ" },
    ],
  },
  {
    title: "สาธารณูปโภค / สุขภาพจิต",
    contacts: [
      { number: "1130", label: "ไฟฟ้าดับ (การไฟฟ้านครหลวง)" },
      { number: "1125", label: "น้ำประปามีปัญหา (การประปานครหลวง)" },
      { number: "1667", label: "สายด่วนกรมสุขภาพจิต" },
    ],
  },
];

/** เดือน/ปีที่ตรวจสอบรายการเบอร์ล่าสุด — อัปเดตทุกครั้งที่แก้รายการด้านบน */
export const lastReviewed = "กันยายน 2569";
