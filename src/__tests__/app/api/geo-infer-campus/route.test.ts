import { NextRequest } from 'next/server';
import { POST } from '@/app/api/geo-infer-campus/route';
import { supabase } from '@/lib/supabase/client';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

describe('POST /api/geo-infer-campus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when coordinates are missing', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Latitude and longitude are required' });
  });

  it('should return 400 when coordinates are invalid', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({ latitude: 100, longitude: 200 }), // Invalid coordinates
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid coordinates' });
  });

  it('should return campus when user is near a campus', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    const mockCampus = {
      id: 'campus-123',
      name: 'Test University',
      latitude: 40.7128,
      longitude: -74.0060,
      radius_miles: 10,
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockCampus,
        error: null,
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      campus: mockCampus,
      distance_miles: expect.any(Number),
    });
  });

  it('should return null campus when user is not near any campus', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({ latitude: 0, longitude: 0 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ campus: null });
  });

  it('should handle database errors gracefully', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to infer campus' });
  });

  it('should handle invalid JSON body', async () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/geo-infer-campus', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid request body' });
  });
});