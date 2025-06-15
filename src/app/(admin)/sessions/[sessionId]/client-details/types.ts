import { ClientDetailsData } from '../types';

export interface Profile {
    fullName: string;
}

export interface Dependant {
    id: string;
    profile?: Profile;
}

export interface Staff {
    id: string;
    profile?: Profile;
}

export type SetDataFunction = (updater: (prev: ClientDetailsData) => ClientDetailsData) => void; 