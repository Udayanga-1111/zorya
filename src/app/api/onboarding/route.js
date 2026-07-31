import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '../../../lib/middleware/withAuth';
import { updateUserOnboarding } from '../../../lib/services/user.service';

const onboardingSchema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  birth_city: z.string().min(2, "City is required"),
  is_approximate_time: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
});

async function onboardingHandler(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    const user = await updateUserOnboarding(userId, {
      birth_date: new Date(validatedData.birth_date),
      birth_time: validatedData.birth_time,
      birth_city: validatedData.birth_city,
      is_approximate_time: validatedData.is_approximate_time,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
    });

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(onboardingHandler);
