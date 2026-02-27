import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  MapPin,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import realtimeService from "../../../services/realtime.service";

interface DoctorOption {
  id: string | number;
  name: string;
  specialization?: string;
  hospitalId?: number | null;
  available?: string[];
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  selectedDoctor?: DoctorOption | null;
  onClose: () => void;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  selectedDoctor: initialDoctor,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState<
    "video" | "in-person"
  >("video");
  const [patientInfo, setPatientInfo] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    meetLink?: string | null;
    message: string;
  } | null>(null);

  // Use initial doctor from props or internal selection
  const activeDoctor = selectedDoctor ?? initialDoctor;

  // Generate next X days dynamically
  const generateNextDays = (days: number) => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate.toISOString().split("T")[0]);
    }
    return dates;
  };

  const availableDates = activeDoctor?.available ?? generateNextDays(7);

  const doctors = [
    { id: 1, name: "Dr. Sarah Chen", specialization: "Cardiology", available: generateNextDays(7) },
    { id: 2, name: "Dr. Michael Rodriguez", specialization: "Neurology", available: generateNextDays(5) },
    { id: 3, name: "Dr. Emma Johnson", specialization: "Pediatrics", available: generateNextDays(10) },
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  ];

  // If initialDoctor is passed, skip step 1
  useEffect(() => {
    if (initialDoctor && isOpen) {
      setSelectedDoctor(initialDoctor);
      setStep(2);
    } else if (!initialDoctor && isOpen) {
      setStep(1);
      setSelectedDoctor(null);
    }
    setError(null);
    setBookingSuccess(null);
  }, [initialDoctor, isOpen]);

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    const now = new Date();
    const selected = new Date(selectedDate);
    return timeSlots.filter((time) => {
      const isToday = selected.toDateString() === now.toDateString();
      if (!isToday) return true;
      const [hourMinute, period] = time.split(" ");
      let [hour, minute] = hourMinute.split(":").map(Number);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0);
      return slotTime > now;
    });
  };

  const parseTimeToISO = (dateStr: string, timeStr: string): string => {
    const [hourMinute, period] = timeStr.split(" ");
    let [hour, minute] = hourMinute.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const d = new Date(dateStr);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const handleSubmit = async () => {
    if (!activeDoctor || !selectedDate || !selectedTime) return;

    if (!isAuthenticated || !user) {
      setError("Please log in to book an appointment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: patientData } = await realtimeService.getPatientForUser(user.id);
      const patientId = patientData?.patientId;
      if (!patientId) {
        setError("No patient profile found. Please complete your profile first.");
        setLoading(false);
        return;
      }

      const scheduledTime = parseTimeToISO(selectedDate, selectedTime);
      const payload = {
        patientId,
        doctorId: parseInt(String(activeDoctor.id)),
        hospitalId: (activeDoctor as any).hospitalId ?? undefined,
        appointmentType: consultationType === "video" ? "online" : "in-person",
        scheduledTime,
        duration: 30,
        symptoms: [],
      };

      const response = await realtimeService.bookAppointment(payload);
      const appointment = response?.data ?? response;

      let message = `Appointment booked successfully with ${activeDoctor.name} on ${selectedDate} at ${selectedTime}.`;
      if (consultationType === "video" && appointment?.meetingLink) {
        message += ` Your Google Meet link is ready.`;
      }

      setBookingSuccess({
        meetLink: appointment?.meetingLink ?? null,
        message,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed to book appointment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(initialDoctor ? 2 : 1);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setPatientInfo({ name: "", email: "" });
    setError(null);
    setBookingSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center text-neutral-900 dark:text-white">
            <Calendar className="mr-2" /> Book Appointment
          </h2>
          <button onClick={handleClose} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <X />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {bookingSuccess ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200">{bookingSuccess.message}</p>
              {bookingSuccess.meetLink && (
                <a
                  href={bookingSuccess.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Google Meet
                </a>
              )}
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                The event has been added to your Google Calendar.
              </p>
            </div>
            <button onClick={handleClose} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Done
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-white">Select Doctor</h3>
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="border dark:border-neutral-600 p-3 rounded-lg mb-2 cursor-pointer hover:border-blue-500 dark:hover:border-primary-500"
                    onClick={() => {
                      setSelectedDoctor(doc as DoctorOption);
                      setStep(2);
                    }}
                  >
                    <div className="flex items-center">
                      <User className="mr-3 text-neutral-600 dark:text-neutral-400" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{doc.name}</div>
                        <div className="text-sm text-neutral-500">{doc.specialization}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-white">Select Date & Time</h3>
                {activeDoctor && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Booking with {activeDoctor.name}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {availableDates.map((date: string) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 border rounded text-sm ${
                        selectedDate === date
                          ? "bg-blue-100 dark:bg-primary-900/30 border-blue-500 dark:border-primary-500"
                          : "dark:border-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      {new Date(date).toLocaleDateString()}
                    </button>
                  ))}
                </div>
                {selectedDate && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {getAvailableTimeSlots().map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 border rounded flex items-center gap-1 ${
                          selectedTime === time
                            ? "bg-blue-100 dark:bg-primary-900/30 border-blue-500 dark:border-primary-500"
                            : "dark:border-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        <Clock className="w-4" />
                        {time}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setConsultationType("video")}
                    className={`p-2 border rounded flex items-center gap-2 ${
                      consultationType === "video"
                        ? "bg-blue-100 dark:bg-primary-900/30 border-blue-500 dark:border-primary-500"
                        : "dark:border-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <Video className="w-4" />
                    Video (Google Meet)
                  </button>
                  <button
                    onClick={() => setConsultationType("in-person")}
                    className={`p-2 border rounded flex items-center gap-2 ${
                      consultationType === "in-person"
                        ? "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500"
                        : "dark:border-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <MapPin className="w-4" />
                    In-Person
                  </button>
                </div>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="font-semibold mb-3 text-neutral-900 dark:text-white">Confirm Appointment</h3>
                <div className="border dark:border-neutral-600 p-3 rounded mb-4">
                  <p><strong>Doctor:</strong> {activeDoctor?.name}</p>
                  <p><strong>Date:</strong> {selectedDate}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Type:</strong> {consultationType === "video" ? "Video (Google Meet)" : "In-Person"}</p>
                </div>
                {consultationType === "video" && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    A Google Meet link will be generated and added to your Google Calendar.
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Confirm & Book"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
