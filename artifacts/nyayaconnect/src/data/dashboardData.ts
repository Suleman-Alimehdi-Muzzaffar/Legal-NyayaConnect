export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "pending" | "rescheduled";

export interface Appointment {
  id: string;
  lawyerName: string;
  lawyerAvatar: string;
  lawyerGradient: string;
  specialization: string;
  date: string;
  time: string;
  duration: number;
  mode: "online" | "offline";
  status: AppointmentStatus;
  caseType: string;
  notes: string;
  fee: number;
  meetLink?: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "contract";
  category: string;
  uploadedAt: string;
  size: string;
  status: "pending_review" | "reviewed" | "approved" | "rejected";
  lawyerName?: string;
  caseId?: string;
}

export interface Notification {
  id: string;
  type: "appointment" | "document" | "message" | "reminder" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionLink?: string;
}

export interface Activity {
  id: string;
  type: "appointment_booked" | "document_uploaded" | "appointment_completed" | "message_received" | "document_approved";
  description: string;
  timestamp: string;
  relatedEntity?: string;
  icon?: string;
}

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    lawyerName: "Adv. Priya Sharma",
    lawyerAvatar: "PS",
    lawyerGradient: "from-[#D4AF37] to-[#8c7324]",
    specialization: "Family Law",
    date: "2026-07-18",
    time: "10:30 AM",
    duration: 45,
    mode: "online",
    status: "upcoming",
    caseType: "Child Custody",
    notes: "Initial consultation regarding visitation rights.",
    fee: 1500,
    meetLink: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "a2",
    lawyerName: "Adv. Rajesh Kumar",
    lawyerAvatar: "RK",
    lawyerGradient: "from-blue-600 to-indigo-800",
    specialization: "Property Law",
    date: "2026-07-22",
    time: "02:00 PM",
    duration: 60,
    mode: "offline",
    status: "upcoming",
    caseType: "Tenant Dispute",
    notes: "Please bring the original lease agreement.",
    fee: 2000
  },
  {
    id: "a3",
    lawyerName: "Adv. Ananya Mehta",
    lawyerAvatar: "AM",
    lawyerGradient: "from-purple-600 to-fuchsia-800",
    specialization: "Corporate Law",
    date: "2026-07-28",
    time: "11:00 AM",
    duration: 30,
    mode: "online",
    status: "upcoming",
    caseType: "Startup Incorporation",
    notes: "Review of founder agreements.",
    fee: 3500,
    meetLink: "https://meet.google.com/xyz-uvwx-yz"
  },
  {
    id: "a4",
    lawyerName: "Adv. Vikram Singh",
    lawyerAvatar: "VS",
    lawyerGradient: "from-orange-600 to-red-800",
    specialization: "Criminal Law",
    date: "2026-07-10",
    time: "04:00 PM",
    duration: 60,
    mode: "offline",
    status: "completed",
    caseType: "Bail Hearing",
    notes: "Bail application drafted and filed.",
    fee: 4000
  },
  {
    id: "a5",
    lawyerName: "Adv. Kavya Reddy",
    lawyerAvatar: "KR",
    lawyerGradient: "from-teal-500 to-emerald-700",
    specialization: "Cyber Law",
    date: "2026-07-05",
    time: "09:30 AM",
    duration: 45,
    mode: "online",
    status: "completed",
    caseType: "Data Privacy",
    notes: "Discussed GDPR compliance requirements.",
    fee: 2500
  },
  {
    id: "a6",
    lawyerName: "Adv. Suresh Nair",
    lawyerAvatar: "SN",
    lawyerGradient: "from-blue-400 to-blue-700",
    specialization: "Consumer Law",
    date: "2026-07-12",
    time: "01:00 PM",
    duration: 30,
    mode: "online",
    status: "cancelled",
    caseType: "Insurance Claim",
    notes: "Client requested cancellation due to scheduling conflict.",
    fee: 1000
  },
  {
    id: "a7",
    lawyerName: "Adv. Meera Iyer",
    lawyerAvatar: "MI",
    lawyerGradient: "from-pink-500 to-rose-800",
    specialization: "Civil Law",
    date: "2026-07-20",
    time: "03:30 PM",
    duration: 45,
    mode: "offline",
    status: "rescheduled",
    caseType: "Contract Dispute",
    notes: "Rescheduled to next week.",
    fee: 1800
  },
  {
    id: "a8",
    lawyerName: "Adv. Arjun Patel",
    lawyerAvatar: "AP",
    lawyerGradient: "from-amber-500 to-orange-700",
    specialization: "Traffic Law",
    date: "2026-07-25",
    time: "12:00 PM",
    duration: 30,
    mode: "online",
    status: "pending",
    caseType: "Challan Dispute",
    notes: "Awaiting confirmation from lawyer.",
    fee: 800
  }
];

export const mockDocuments: Document[] = [
  {
    id: "d1",
    name: "Property_Agreement_Draft.pdf",
    type: "pdf",
    category: "Property",
    uploadedAt: "2026-07-15T10:30:00Z",
    size: "2.4 MB",
    status: "pending_review",
    lawyerName: "Adv. Rajesh Kumar"
  },
  {
    id: "d2",
    name: "Family_Court_Petition.docx",
    type: "doc",
    category: "Family",
    uploadedAt: "2026-07-14T14:20:00Z",
    size: "1.1 MB",
    status: "reviewed",
    lawyerName: "Adv. Priya Sharma"
  },
  {
    id: "d3",
    name: "Employment_Contract_Signed.pdf",
    type: "contract",
    category: "Corporate",
    uploadedAt: "2026-07-10T09:15:00Z",
    size: "3.5 MB",
    status: "approved",
    lawyerName: "Adv. Ananya Mehta"
  },
  {
    id: "d4",
    name: "Evidence_Photos.zip",
    type: "image",
    category: "Criminal",
    uploadedAt: "2026-07-12T16:45:00Z",
    size: "15.2 MB",
    status: "pending_review",
    lawyerName: "Adv. Vikram Singh"
  },
  {
    id: "d5",
    name: "Affidavit_Draft_v2.pdf",
    type: "pdf",
    category: "Civil",
    uploadedAt: "2026-07-16T11:00:00Z",
    size: "0.8 MB",
    status: "rejected",
    lawyerName: "Adv. Meera Iyer"
  },
  {
    id: "d6",
    name: "Non_Disclosure_Agreement.pdf",
    type: "contract",
    category: "Corporate",
    uploadedAt: "2026-07-08T10:00:00Z",
    size: "1.5 MB",
    status: "approved",
    lawyerName: "Adv. Ananya Mehta"
  },
  {
    id: "d7",
    name: "Police_Complaint_Copy.jpg",
    type: "image",
    category: "Criminal",
    uploadedAt: "2026-07-09T13:30:00Z",
    size: "4.2 MB",
    status: "reviewed",
    lawyerName: "Adv. Vikram Singh"
  },
  {
    id: "d8",
    name: "Lease_Renewal_Notice.doc",
    type: "doc",
    category: "Property",
    uploadedAt: "2026-07-17T09:45:00Z",
    size: "0.5 MB",
    status: "pending_review",
    lawyerName: "Adv. Rajesh Kumar"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your appointment with Adv. Priya Sharma is confirmed for July 18 at 10:30 AM.",
    timestamp: "2026-07-16T08:00:00Z",
    isRead: false,
    actionLabel: "View Details",
    actionLink: "/dashboard/appointments"
  },
  {
    id: "n2",
    type: "document",
    title: "Document Reviewed",
    message: "Adv. Priya Sharma has reviewed your 'Family_Court_Petition.docx'.",
    timestamp: "2026-07-15T15:30:00Z",
    isRead: false,
    actionLabel: "View Document",
    actionLink: "/dashboard/documents"
  },
  {
    id: "n3",
    type: "message",
    title: "New Message",
    message: "Adv. Rajesh Kumar: Please ensure you bring the original lease...",
    timestamp: "2026-07-15T11:20:00Z",
    isRead: false
  },
  {
    id: "n4",
    type: "reminder",
    title: "Upcoming Appointment",
    message: "Reminder: You have an appointment with Adv. Ananya Mehta tomorrow.",
    timestamp: "2026-07-27T09:00:00Z",
    isRead: true
  },
  {
    id: "n5",
    type: "system",
    title: "Profile Updated",
    message: "Your profile information was updated successfully.",
    timestamp: "2026-07-10T14:00:00Z",
    isRead: true
  },
  {
    id: "n6",
    type: "document",
    title: "Document Approved",
    message: "Your 'Employment_Contract_Signed.pdf' has been approved.",
    timestamp: "2026-07-11T10:15:00Z",
    isRead: true
  },
  {
    id: "n7",
    type: "appointment",
    title: "Appointment Rescheduled",
    message: "Adv. Meera Iyer has requested to reschedule your appointment.",
    timestamp: "2026-07-14T16:45:00Z",
    isRead: true,
    actionLabel: "Respond",
    actionLink: "/dashboard/appointments"
  },
  {
    id: "n8",
    type: "system",
    title: "Security Alert",
    message: "New login detected from Mumbai, India.",
    timestamp: "2026-07-01T08:30:00Z",
    isRead: true
  },
  {
    id: "n9",
    type: "message",
    title: "New Message",
    message: "NyayaConnect Support: Your ticket #4592 has been resolved.",
    timestamp: "2026-07-05T12:00:00Z",
    isRead: true
  },
  {
    id: "n10",
    type: "document",
    title: "Document Rejected",
    message: "Adv. Meera Iyer has requested changes to 'Affidavit_Draft_v2.pdf'.",
    timestamp: "2026-07-16T11:05:00Z",
    isRead: true
  },
  {
    id: "n11",
    type: "appointment",
    title: "Appointment Cancelled",
    message: "Your appointment with Adv. Suresh Nair was cancelled.",
    timestamp: "2026-07-12T09:00:00Z",
    isRead: true
  },
  {
    id: "n12",
    type: "reminder",
    title: "Action Required",
    message: "Please complete your profile to get the best out of NyayaConnect.",
    timestamp: "2026-06-25T10:00:00Z",
    isRead: true,
    actionLabel: "Complete Profile",
    actionLink: "/dashboard/profile"
  }
];

export const mockActivities: Activity[] = [
  {
    id: "act1",
    type: "appointment_booked",
    description: "Booked an appointment with Adv. Priya Sharma",
    timestamp: "2026-07-16T10:00:00Z",
    icon: "CalendarPlus"
  },
  {
    id: "act2",
    type: "document_uploaded",
    description: "Uploaded 'Property_Agreement_Draft.pdf'",
    timestamp: "2026-07-15T10:30:00Z",
    icon: "Upload"
  },
  {
    id: "act3",
    type: "message_received",
    description: "Received a message from Adv. Rajesh Kumar",
    timestamp: "2026-07-15T11:20:00Z",
    icon: "MessageSquare"
  },
  {
    id: "act4",
    type: "document_approved",
    description: "Adv. Ananya Mehta approved 'Employment_Contract_Signed.pdf'",
    timestamp: "2026-07-11T10:15:00Z",
    icon: "FileCheck"
  },
  {
    id: "act5",
    type: "appointment_completed",
    description: "Completed consultation with Adv. Vikram Singh",
    timestamp: "2026-07-10T17:00:00Z",
    icon: "CalendarCheck"
  },
  {
    id: "act6",
    type: "document_uploaded",
    description: "Uploaded 'Evidence_Photos.zip'",
    timestamp: "2026-07-12T16:45:00Z",
    icon: "Upload"
  },
  {
    id: "act7",
    type: "appointment_booked",
    description: "Booked an appointment with Adv. Ananya Mehta",
    timestamp: "2026-07-08T14:20:00Z",
    icon: "CalendarPlus"
  },
  {
    id: "act8",
    type: "appointment_completed",
    description: "Completed consultation with Adv. Kavya Reddy",
    timestamp: "2026-07-05T10:15:00Z",
    icon: "CalendarCheck"
  },
  {
    id: "act9",
    type: "document_uploaded",
    description: "Uploaded 'Non_Disclosure_Agreement.pdf'",
    timestamp: "2026-07-08T10:00:00Z",
    icon: "Upload"
  },
  {
    id: "act10",
    type: "appointment_booked",
    description: "Booked an appointment with Adv. Rajesh Kumar",
    timestamp: "2026-07-02T09:30:00Z",
    icon: "CalendarPlus"
  }
];
