"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AvailabilityPicker } from "./AvailabilityPicker";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const sessionRequestSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  staffId: z.string().min(1, "Staff member is required"),
  counselorId: z.string().min(1, "Counselor is required"),
  sessionType: z.enum(["individual", "group", "couple"], {
    required_error: "Session type is required",
  }),
  sessionMethod: z.enum(["online", "physical"], {
    required_error: "Session method is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type SessionRequestFormData = z.infer<typeof sessionRequestSchema>;

interface Company {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  companyId: string;
}

interface Counselor {
  id: string;
  name: string;
  email: string;
}

interface StepperSessionRequestFormProps {
  companies: Company[];
  staff: Staff[];
  counselors: Counselor[];
  onSubmit: (data: SessionRequestFormData) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const steps = [
  "Company & Staff",
  "Counselor & Type",
  "Method & Location",
  "Date & Time",
  "Notes & Review",
];

export function StepperSessionRequestForm({
  companies,
  staff,
  counselors,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: StepperSessionRequestFormProps) {
  const [step, setStep] = React.useState(0);
  const [selectedCompany, setSelectedCompany] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = React.useState<{ start: string; end: string }>();
  const [duration, setDuration] = React.useState<number>(60); // default 60 min
  const [wholeDay, setWholeDay] = React.useState<boolean>(false);
  const [activityType, setActivityType] = React.useState<'company' | 'staff'>('staff');
  const [selfOrBeneficiary, setSelfOrBeneficiary] = React.useState<'self' | 'beneficiary'>('self');
  const [beneficiaries, setBeneficiaries] = React.useState<any[]>([]);
  const [showAddBeneficiary, setShowAddBeneficiary] = React.useState(false);
  const [newBeneficiary, setNewBeneficiary] = React.useState({ name: '', dob: '', gender: '', relationship: '', selectedId: '' });

  const methods = useForm<SessionRequestFormData>({
    resolver: zodResolver(sessionRequestSchema),
    mode: "onTouched",
  });
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = methods;

  const sessionMethod = watch("sessionMethod");
  const filteredStaff = staff.filter((s) => s.companyId === selectedCompany);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setValue("companyId", String(companyId));
    setValue("staffId", "");
  };

  const handleTimeSelect = (date: Date, startTime: string) => {
    if (wholeDay) {
      setSelectedTime({ start: "00:00", end: "23:59" });
      setValue("startTime", "00:00");
      setValue("endTime", "23:59");
      return;
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      setValue("date", date);
    }
    // Calculate end time based on selected duration
    const start = dayjs(startTime, "HH:mm");
    const end = start.add(duration, "minute").format("HH:mm");
    setSelectedTime({ start: startTime, end });
    setValue("startTime", String(startTime));
    setValue("endTime", String(end));
  };

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: (keyof SessionRequestFormData)[] = [];
    if (step === 0) fieldsToValidate = ["companyId", "staffId"];
    if (step === 1) fieldsToValidate = ["counselorId", "sessionType"];
    if (step === 2) fieldsToValidate = ["sessionMethod", ...(getValues("sessionMethod") === "physical" ? ["location"] : [])];
    if (step === 3) fieldsToValidate = ["date", "startTime", "endTime"];
    if (step === 4) fieldsToValidate = [];
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const onFormSubmit = async (data: SessionRequestFormData) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 w-full max-w-5xl mx-auto px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Request a Session</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {steps.map((label, idx) => (
                <div key={label} className="flex items-center">
                  <div
                    className={
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                      (step === idx
                        ? "bg-indigo-600 text-white"
                        : idx < step
                          ? "bg-indigo-200 text-indigo-800"
                          : "bg-gray-200 text-gray-500")
                    }
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-8 h-1 bg-gray-200 mx-1 rounded-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">{steps[step]}</div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Select onValueChange={handleCompanyChange} value={selectedCompany}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.companyId && (
                        <p className="text-sm text-red-500">{errors.companyId.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <Label className="mb-1">Session for?</Label>
                      <RadioGroup
                        value={activityType}
                        onValueChange={v => setActivityType(v as 'company' | 'staff')}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="company" id="activity-company" />
                          <Label htmlFor="activity-company" className="cursor-pointer">Company Activity</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="staff" id="activity-staff" />
                          <Label htmlFor="activity-staff" className="cursor-pointer">Staff Activity</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {activityType === 'staff' && (
                    <>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="staff">Staff Member</Label>
                        <Select
                          onValueChange={(value) => setValue("staffId", value)}
                          disabled={!selectedCompany}
                          value={getValues("staffId")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredStaff.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.staffId && (
                          <p className="text-sm text-red-500">{errors.staffId.message}</p>
                        )}
                      </div>
                      <div className="flex gap-4 items-end mt-4">
                        <div className="flex items-center gap-2">
                          <Label className="mr-2">Who is this for?</Label>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded border ${selfOrBeneficiary === 'self' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300'}`}
                            onClick={() => setSelfOrBeneficiary('self')}
                          >
                            Self
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded border ${selfOrBeneficiary === 'beneficiary' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300'}`}
                            onClick={() => setSelfOrBeneficiary('beneficiary')}
                          >
                            Beneficiary
                          </button>
                        </div>
                        <div className="flex-1 flex items-center gap-2 ml-8">
                          <Label htmlFor="sessionType" className="mr-2">Session Type</Label>
                          <Select
                            onValueChange={(value) => setValue("sessionType", value as 'individual' | 'group' | 'couple')}
                            value={getValues("sessionType") || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select session type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                              <SelectItem value="couple">Couple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {selfOrBeneficiary === 'beneficiary' && (
                        <div className="mt-4 w-full max-w-4xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm">Beneficiary</Label>
                            <div className="w-80">
                              <Select
                                value={newBeneficiary.selectedId || ''}
                                onValueChange={val => setNewBeneficiary({ ...newBeneficiary, selectedId: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select beneficiary" />
                                </SelectTrigger>
                                <SelectContent>
                                  {beneficiaries.length > 0 && beneficiaries.map((b, i) => (
                                    <SelectItem key={i} value={b.name}>{b.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              className="h-7 w-7 p-0 text-base"
                              variant="outline"
                              onClick={() => setShowAddBeneficiary(true)}
                            >
                              +
                            </Button>
                          </div>
                          {showAddBeneficiary && (
                            <div className="border rounded bg-gray-50 p-3 mb-2 w-full max-w-2xl">
                              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    className="py-1 px-2 text-xs"
                                    placeholder="Name"
                                    value={newBeneficiary.name}
                                    onChange={e => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">DOB</Label>
                                  <Input
                                    className="py-1 px-2 text-xs"
                                    placeholder="DOB"
                                    value={newBeneficiary.dob}
                                    onChange={e => setNewBeneficiary({ ...newBeneficiary, dob: e.target.value })}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Gender</Label>
                                  <Input
                                    className="py-1 px-2 text-xs"
                                    placeholder="Gender"
                                    value={newBeneficiary.gender}
                                    onChange={e => setNewBeneficiary({ ...newBeneficiary, gender: e.target.value })}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Relationship</Label>
                                  <Input
                                    className="py-1 px-2 text-xs"
                                    placeholder="Relationship"
                                    value={newBeneficiary.relationship}
                                    onChange={e => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
                                  />
                                </div>
                                <div className="flex gap-2 mt-2 col-span-full">
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="text-xs px-3 py-1"
                                    onClick={() => {
                                      setBeneficiaries([...beneficiaries, newBeneficiary]);
                                      setNewBeneficiary({ name: '', dob: '', gender: '', relationship: '', selectedId: '' });
                                      setShowAddBeneficiary(false);
                                    }}
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="text-xs px-3 py-1"
                                    variant="outline"
                                    onClick={() => setShowAddBeneficiary(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </div>
                          )}
                          {beneficiaries.length > 0 && (
                            <div className="mt-2">
                              <Label className="text-xs">Beneficiaries</Label>
                              <ul className="border rounded bg-white p-2 mt-1">
                                {beneficiaries.map((b, i) => (
                                  <li key={i} className="flex gap-4 text-xs py-1 border-b last:border-b-0">
                                    <span>{b.name}</span>
                                    <span>{b.gender}</span>
                                    <span>{b.dob}</span>
                                    <span>{b.relationship}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="counselor">Counselor</Label>
                    <Select onValueChange={(value) => setValue("counselorId", value)} value={getValues("counselorId") || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select counselor" />
                      </SelectTrigger>
                      <SelectContent>
                        {counselors.map((counselor) => (
                          <SelectItem key={counselor.id} value={counselor.id}>
                            {counselor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.counselorId && (
                      <p className="text-sm text-red-500">{errors.counselorId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select
                      onValueChange={(value) => setValue("sessionType", value as "individual" | "group" | "couple")}
                      value={getValues("sessionType") || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sessionType && (
                      <p className="text-sm text-red-500">{errors.sessionType.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="sessionMethod">Session Method</Label>
                    <Select
                      onValueChange={(value) => setValue("sessionMethod", value as "online" | "physical")}
                      value={getValues("sessionMethod") || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sessionMethod && (
                      <p className="text-sm text-red-500">{errors.sessionMethod.message}</p>
                    )}
                  </div>
                  {getValues("sessionMethod") === "physical" && (
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Enter physical location"
                        {...register("location")}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">{errors.location.message}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label>Date & Time</Label>
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="max-w-xs">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date instanceof Date && !isNaN(date.getTime())) {
                                setSelectedDate(date);
                                setValue("date", date);
                                setSelectedTime(undefined); // reset selected time when date changes
                                setValue("startTime", "");
                                setValue("endTime", "");
                                setWholeDay(false);
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm text-red-500">{errors.date.message}</p>
                      )}
                      <div className="mt-4 space-y-2">
                        <Label>Session Duration</Label>
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={duration}
                          onChange={e => setDuration(Number(e.target.value))}
                          disabled={wholeDay}
                        >
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1 hour 30 minutes</option>
                          <option value={120}>2 hours</option>
                        </select>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={wholeDay}
                            onChange={e => {
                              setWholeDay(e.target.checked);
                              if (e.target.checked) {
                                setSelectedTime({ start: "00:00", end: "23:59" });
                                setValue("startTime", "00:00");
                                setValue("endTime", "23:59");
                              } else {
                                setSelectedTime(undefined);
                                setValue("startTime", "");
                                setValue("endTime", "");
                              }
                            }}
                          />
                          Whole day
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col items-end w-full">
                      {selectedTime && selectedTime.start && selectedTime.end && (
                        <div className="bg-gray-100 border rounded px-4 py-2 text-sm font-medium text-gray-700">
                          {wholeDay
                            ? "Whole day"
                            : `Selected Time: ${dayjs(selectedTime.start, "HH:mm").format("h:mm A")} - ${dayjs(selectedTime.end, "HH:mm").format("h:mm A")}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedDate !== undefined && !wholeDay && (
                    <div className="mt-4">
                      <AvailabilityPicker
                        onTimeSelect={(date, startTime) => {
                          if (date) handleTimeSelect(date, startTime);
                        }}
                        counselorId={selectedCompany}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or requirements"
                    {...register("notes")}
                  />
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Review</h4>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(getValues(), null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between mt-8 gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              {step > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
} 