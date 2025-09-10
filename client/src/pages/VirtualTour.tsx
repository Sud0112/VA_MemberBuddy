import React, { useState, useEffect } from 'react';

interface ProspectData {
  name: string;
  email: string;
  location: string;
  interest: string;
  fitnessLevel: string;
  goals?: string;
  preferredSchedule?: string;
}

interface TourMetrics {
  success: boolean;
  prospectName: string;
  prospectEmail: string;
  trackingId: string;
}

const VirtualTour: React.FC = () => {
  const location = useLocation();
  const [prospectData, setProspectData] = useState<ProspectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackingParam = params.get('track');
    
    if (trackingParam) {
      setTrackingId(trackingParam);
      recordTourView(trackingParam);
    } else {
      setIsLoading(false);
    }
  }, []);

  const recordTourView = async (trackingIdParam: string) => {
    try {
      const response = await fetch(`/api/virtual-tour/${trackingIdParam}`);
      if (response.ok) {
        const tourMetrics: TourMetrics = await response.json();
        
        // Load CRM data to get prospect details
        const crmResponse = await fetch('/crm_data.json');
        const crmData = await crmResponse.json();
        
        // Find matching prospect by email
        const prospect = crmData.find((p: any) => 
          p.email === tourMetrics.prospectEmail ||
          p.name.toLowerCase().includes(tourMetrics.prospectName.toLowerCase())
        );
        
        if (prospect) {
          setProspectData({
            name: prospect.name,
            email: prospect.email,
            location: prospect.location,
            interest: prospect.interest,
            fitnessLevel: prospect.fitnessLevel,
            goals: prospect.goals,
            preferredSchedule: prospect.preferredSchedule,
          });
        }
      }
    } catch (error) {
      console.error('Failed to record tour view:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalizedContent = () => {
    if (!prospectData) {
      return renderDefaultTour();
    }

    return (
      <div className="bg-white">
        {/* Personalized Hero Section */}
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl mx-auto px-6">
              <h1 className="text-5xl font-bold mb-4">
                Welcome {prospectData.name.split(' ')[0]}!
              </h1>
              <p className="text-xl mb-6">
                Your personalized Virgin Active experience in {prospectData.location}
              </p>
              <p className="text-lg opacity-90">
                Based on your interest in {prospectData.interest.toLowerCase()}, 
                we've created a tour tailored just for you.
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Facilities Section */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Facilities Perfect for Your {prospectData.interest} Goals
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getPersonalizedFacilities(prospectData.interest).map((facility, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={facility.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{facility.name}</h3>
                    <p className="text-gray-600 mb-4">{facility.description}</p>
                    <div className="text-red-600 font-medium">
                      Perfect for: {facility.suitableFor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Classes Section */}
        <div className="bg-gray-50 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Classes Recommended for {prospectData.fitnessLevel} Level
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {getPersonalizedClasses(prospectData.fitnessLevel).map((classItem, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                      {classItem.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                      <p className="text-red-600 font-medium">{classItem.level} • {classItem.duration}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{classItem.description}</p>
                  <div className="text-sm text-gray-500">
                    Next session: {classItem.nextSession}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal CTA Section */}
        <div className="bg-red-600 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Your {prospectData.interest} Journey, {prospectData.name.split(' ')[0]}?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Join Virgin Active {prospectData.location} and transform your fitness goals into reality.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a
                href="tel:020-3837-4721"
                className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Call 020 3837 4721
              </a>
              <a
                href="mailto:sales@virginactive.co.uk"
                className="inline-block bg-red-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-900 transition-colors"
              >
                Email Us Today
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultTour = () => (
    <div className="bg-white">
      {/* Default Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to Virgin Active
            </h1>
            <p className="text-xl mb-6">
              Discover world-class fitness facilities and expert guidance
            </p>
            <p className="text-lg opacity-90">
              Join Britain's leading premium health club
            </p>
          </div>
        </div>
      </div>

      {/* Default facilities and contact */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Experience Virgin Active
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Visit our state-of-the-art facilities and discover how we can help you achieve your fitness goals.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="tel:020-3837-4721"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
            >
              Call 020 3837 4721
            </a>
            <a
              href="mailto:sales@virginactive.co.uk"
              className="inline-block bg-white text-red-600 border-2 border-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-50 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {renderPersonalizedContent()}
    </div>
  );
};

// Helper functions for personalized content
const getPersonalizedFacilities = (interest: string) => {
  const facilityMap: Record<string, any[]> = {
    'Weight Training': [
      {
        name: 'Free Weights Area',
        description: 'Complete range of dumbbells, barbells, and plates for serious strength training.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Muscle building and strength'
      },
      {
        name: 'Power Lifting Platform',
        description: 'Dedicated platforms for deadlifts, squats, and Olympic lifts.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Advanced weight training'
      },
      {
        name: 'Recovery Suite',
        description: 'Sauna, steam room, and massage services for optimal recovery.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Post-workout recovery'
      }
    ],
    'Cardio': [
      {
        name: 'Cardio Zone',
        description: 'Latest treadmills, bikes, and ellipticals with entertainment systems.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Cardiovascular fitness'
      },
      {
        name: 'Indoor Cycling Studio',
        description: 'High-energy spin classes with immersive sound and lighting.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'High-intensity cardio'
      },
      {
        name: 'Running Track',
        description: 'Indoor track for weather-independent running and walking.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Running enthusiasts'
      }
    ],
    'Swimming': [
      {
        name: '25m Swimming Pool',
        description: 'Competition-standard pool with dedicated lanes for serious swimmers.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Lap swimming and training'
      },
      {
        name: 'Hydrotherapy Pool',
        description: 'Warm water pool perfect for aqua aerobics and recovery.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Low-impact exercise'
      },
      {
        name: 'Poolside Relaxation',
        description: 'Comfortable lounging area with refreshments available.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        suitableFor: 'Post-swim relaxation'
      }
    ]
  };

  return facilityMap[interest] || facilityMap['Weight Training'];
};

const getPersonalizedClasses = (fitnessLevel: string) => {
  const classMap: Record<string, any[]> = {
    'Beginner': [
      {
        name: 'Introduction to Fitness',
        level: 'Beginner',
        duration: '45 mins',
        description: 'Perfect starting point covering basic movements and gym etiquette.',
        nextSession: 'Tomorrow 10:00'
      },
      {
        name: 'Gentle Yoga',
        level: 'Beginner',
        duration: '60 mins', 
        description: 'Relaxing yoga focusing on flexibility and stress relief.',
        nextSession: 'Today 18:00'
      }
    ],
    'Intermediate': [
      {
        name: 'HIIT Training',
        level: 'Intermediate',
        duration: '45 mins',
        description: 'High-intensity interval training for maximum calorie burn.',
        nextSession: 'Tomorrow 07:00'
      },
      {
        name: 'Strength & Conditioning',
        level: 'Intermediate',
        duration: '50 mins',
        description: 'Build functional strength with compound movements.',
        nextSession: 'Today 19:00'
      }
    ],
    'Advanced': [
      {
        name: 'CrossFit',
        level: 'Advanced',
        duration: '60 mins',
        description: 'Intense functional fitness combining cardio and strength.',
        nextSession: 'Tomorrow 06:00'
      },
      {
        name: 'Olympic Lifting',
        level: 'Advanced',
        duration: '75 mins',
        description: 'Master the clean & jerk and snatch with expert coaching.',
        nextSession: 'Today 17:30'
      }
    ]
  };

  return classMap[fitnessLevel] || classMap['Intermediate'];
};

export default VirtualTour;