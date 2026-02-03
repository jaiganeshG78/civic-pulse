import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  X,
  Navigation
} from 'lucide-react';
import { GeoLocation } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding would happen here via backend
        // For demo, we'll use a placeholder place name
        setLocation({
          latitude,
          longitude,
          place: 'Detected Location, Bangalore',
        });
        setIsLocating(false);
      },
      (error) => {
        setLocationError('Failed to detect location. Please enable GPS.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 10MB',
          variant: 'destructive',
        });
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast({
        title: 'Image required',
        description: 'Please upload a photo of the issue',
        variant: 'destructive',
      });
      return;
    }

    if (!location) {
      toast({
        title: 'Location required',
        description: 'Please enable location detection',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Issue reported successfully!',
        description: 'AI is analyzing your report. You will receive updates soon.',
      });
      
      navigate('/my-issues');
    } catch (error) {
      toast({
        title: 'Failed to submit',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout requireAuth allowedRoles={['citizen']}>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Report an Issue</h1>
          <p className="mt-2 text-muted-foreground">
            Help improve your community by reporting civic issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Upload a photo and we'll automatically detect the issue type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Photo of Issue *</Label>
                <div 
                  className={`relative rounded-lg border-2 border-dashed transition-colors ${
                    imagePreview 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-64 w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer flex-col items-center justify-center py-12"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Click to upload a photo</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  AI will generate a summary based on the image
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location *</Label>
                {locationError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{locationError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  {isLocating ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm">Detecting your location...</span>
                    </div>
                  ) : location ? (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{location.place}</p>
                          <p className="text-xs text-muted-foreground">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      className="w-full"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Detect Location
                    </Button>
                  )}
                </div>
              </div>

              {/* Info box */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Our AI will automatically detect the issue category and priority 
                  based on your photo. You'll receive SMS updates on the status.
                </AlertDescription>
              </Alert>

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting || !image || !location}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
