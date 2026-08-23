'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface EventTypeSelectorProps {
  onSelect: (eventType: string) => void;
}

export function EventTypeSelector({ onSelect }: EventTypeSelectorProps) {
  const { eventTypePrices } = useBooking();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {eventTypePrices.map((event) => (
        <Card key={event.type} className="border-2 border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer">
          <CardHeader className="text-center">
            <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Starting Price:</p>
              <p className="text-2xl font-bold text-blue-600">₱{event.price.toLocaleString()}</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => onSelect(event.type)}
              className="w-full"
            >
              Choose Event
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
