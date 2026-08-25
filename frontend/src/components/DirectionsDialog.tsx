import { useCallback, useEffect, useState } from 'react';
import {
  useLoadScript,
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, MapPin, Navigation, ExternalLink, AlertTriangle } from 'lucide-react';

interface DirectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerName: string;
  officeAddress?: string;
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
const mapContainerStyle = { width: '100%', height: '420px' } as const;

const DirectionsDialog = ({ open, onOpenChange, lawyerName, officeAddress }: DirectionsDialogProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
  });

  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDestination(null);
      setOrigin(null);
      setDirections(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!isLoaded || !open || !officeAddress) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: officeAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setDestination({ lat: loc.lat(), lng: loc.lng() });
      } else {
        setError('Could not locate this address on the map.');
      }
    });
  }, [isLoaded, open, officeAddress]);

  useEffect(() => {
    if (!open || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError('Could not get your current location. Showing the office location only.'),
    );
  }, [open]);

  const directionsCallback = useCallback(
    (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === 'OK' && result) {
        setDirections(result);
      } else {
        setError('Could not calculate the route to this location.');
      }
    },
    [],
  );

  const mapsLink = officeAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeAddress)}`
    : undefined;

  const renderBody = () => {
    if (!apiKey) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
          <p className="text-sm text-gray-300">Google Maps API key is not configured.</p>
          <p className="text-xs text-gray-500">Add <code className="px-1.5 py-0.5 bg-white/10 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to <code className="px-1.5 py-0.5 bg-white/10 rounded">frontend/.env</code> and restart the dev server.</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p className="text-sm text-gray-300">Failed to load Google Maps. Check the API key and that the Maps JavaScript API is enabled.</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-sm text-gray-400">Loading map…</p>
        </div>
      );
    }

    if (error && !destination) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl overflow-hidden border border-white/10">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={destination ?? DEFAULT_CENTER}
            zoom={destination ? 14 : 4}
            options={{ fullscreenControl: false, streetViewControl: false, mapTypeControl: false }}
          >
            {destination && <Marker position={destination} title={lawyerName} />}
            {destination && origin && (
              <DirectionsService
                options={{ destination, origin, travelMode: google.maps.TravelMode.DRIVING }}
                callback={directionsCallback}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-300">
          <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <span>{officeAddress}</span>
        </div>
        {origin && !directions && !error && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Navigation className="w-3.5 h-3.5" />
            Calculating driving route from your location…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{lawyerName}</DialogTitle>
          <DialogDescription>Directions to the office</DialogDescription>
        </DialogHeader>
        {renderBody()}
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DirectionsDialog;