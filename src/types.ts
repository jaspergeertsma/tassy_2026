
export interface ItineraryDay {
    date: string;
    dayNumber: number;
    title: string;
    region: string;
    locations: string[];
    activities: ({ name: string; url?: string } | string)[];
    drive?: {
        km: number;
        time: string;
    };
    notes?: string;
    images: string[];
}

export interface Stay {
    id?: string;
    name: string;
    location?: string;
    region?: string;
    type?: string;
    coordinates?: [number, number];
    checkIn: string;
    checkOut: string;
    days?: number;
    images?: string[];
    link?: string;
    amenities?: string[];
    price?: string;
}

export interface FlightSegment {
    from: string;
    to: string;
    departLocal: string;
    arriveLocal: string;
    airline: string;
    flightNo: string;
    duration: string;
    layover?: string;
    date?: string;
}

export interface Flight {
    direction: 'outbound' | 'return';
    segments: FlightSegment[];
}

export interface AppData {
    itineraryDays: ItineraryDay[];
    stays: Stay[];
    flights: Flight[];
}
