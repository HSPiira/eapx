import { fetchServices, createService } from "@/api/services";
import { useGenericQuery, useGenericMutation } from "../generic-create";
import { ServicesResponse, Service } from "@/types/services";
import { ServiceFormData } from "@/components/admin/services/service-form";

export function useServices() {
    return useGenericQuery<ServicesResponse>(['services'], fetchServices);
}

export function useCreateService() {
    return useGenericMutation<Service, ServiceFormData>(
        ['create-service'],
        (data) => createService(data)
    );
}