
import { fetchProfile, updateProfile } from "@/api/auth";
import { useGenericQuery, useGenericMutation } from "../generic-create";
import { Profile } from "@/types/profile";

export function useProfile() {
    return useGenericQuery<Profile>(['profile'], fetchProfile);
}

export function useUpdateProfile() {
    return useGenericMutation<Profile, Partial<Profile>>(
        ['update-profile'],
        (data) => updateProfile(data)
    );
}
