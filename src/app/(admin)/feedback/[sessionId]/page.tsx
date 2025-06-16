"use client";
import React from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

const mockValues = {
    date: new Date(),
    clientFirstName: "Jane",
    surname: "Doe",
    dependentId: "12345",
    gender: "Female",
    company: "Acme Corp",
    contact: "+256700000000",
    email: "jane.doe@example.com",
    nextOfKin: "John Doe",
    nextOfKinContact: "+256711111111",
    intervention: "Counseling",
    rate: 50000,
    issue: "Stress Management",
    counselor: "Dr. Smith",
    time: "14:00",
    diagnosis: "Mild Anxiety",
    appointmentBy: "Self",
    status: "Completed",
    clientFeedback: "Very helpful session."
};

const genderOptions = ["Male", "Female", "Other"];
const statusOptions = ["Completed", "Pending", "Cancelled"];

export default function FeedbackPage() {
    const methods = useForm({
        defaultValues: mockValues,
    });

    return (
        <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 my-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Session Feedback</h1>
            <Form {...methods}>
                <div className="flex flex-col gap-4">
                    {/* Date */}
                    <FormField
                        name="date"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <DatePicker value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Client First Name */}
                    <FormField
                        name="clientFirstName"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Surname */}
                    <FormField
                        name="surname"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Surname</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Dependent/ID# */}
                    <FormField
                        name="dependentId"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dependent/ID#</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Gender */}
                    <FormField
                        name="gender"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Company */}
                    <FormField
                        name="company"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Contact */}
                    <FormField
                        name="contact"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Email */}
                    <FormField
                        name="email"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Next of Kin */}
                    <FormField
                        name="nextOfKin"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Next of Kin</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Next of Kin Contact */}
                    <FormField
                        name="nextOfKinContact"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Next of Kin Contact</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Intervention */}
                    <FormField
                        name="intervention"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intervention</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Rate (UGX) */}
                    <FormField
                        name="rate"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rate (UGX)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Issue/Topic */}
                    <FormField
                        name="issue"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Issue/Topic</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Counselor */}
                    <FormField
                        name="counselor"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Counselor</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Time */}
                    <FormField
                        name="time"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Diagnosis */}
                    <FormField
                        name="diagnosis"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Diagnosis</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Appointment By */}
                    <FormField
                        name="appointmentBy"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Appointment By</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Status */}
                    <FormField
                        name="status"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Client Feedback */}
                    <FormField
                        name="clientFeedback"
                        control={methods.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client Feedback</FormLabel>
                                <FormControl>
                                    <Textarea rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" className="mt-6 w-full">Save (Mock)</Button>
                </div>
            </Form>
        </div>
    );
}