
export interface ItineraryDay {
	date: string;
	dayNumber: number;
	title: string;
	region: string;
	locations: string[];
	activities: string[];
	drive?: {
		km: number;
		time: string;
	};
	notes?: string;
	images: string[];
}

export interface Stay {
	name: string;
	location: string;
	coordinates: [number, number]; // [lat, lng] or [lng, lat] depending on map lib (usually [lat, lng] for Leaflet)
	checkIn: string;
	checkOut: string;
	highlights: string[];
	images: string[];
	price?: string;
	region?: string;
	link?: string;
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
