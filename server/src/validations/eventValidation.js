const { z } = require('zod');

const urlRegex = /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/i;

const createEventSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title cannot exceed 120 characters'),
    summary: z
      .string({ required_error: 'Summary is required' })
      .trim()
      .min(10, 'Summary must be at least 10 characters')
      .max(300, 'Summary cannot exceed 300 characters'),
    description: z
      .string({ required_error: 'Full description is required' })
      .trim()
      .min(20, 'Description must be at least 20 characters'),
    bannerUrl: z
      .string({ required_error: 'Banner URL is required' })
      .trim().min(5, 'Image is required'),
    startDate: z
      .string({ required_error: 'Start date/time is required' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid ISO date',
      }),
    endDate: z
      .string({ required_error: 'End date/time is required' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'End date must be a valid ISO date',
      }),
    format: z.enum(['online', 'in-person'], {
      required_error: 'Format is required (online or in-person)',
    }),
    venue: z
      .string({ required_error: 'Venue or online link is required' })
      .trim()
      .min(3, 'Venue or link must be at least 3 characters'),
    category: z.enum(
      ['Technology', 'Design', 'Business', 'Marketing', 'Workshop', 'Conference', 'Other'],
      { required_error: 'Category is required' }
    ),
    tags: z
      .array(z.string().trim())
      .optional()
      .default([]),
    targetAudience: z
      .string({ required_error: 'Target audience is required' })
      .trim()
      .min(3, 'Target audience must be at least 3 characters'),
    registrationUrl: z
      .string({ required_error: 'Registration URL is required' })
      .trim()
      .refine((val) => urlRegex.test(val), {
        message: 'Registration URL must be a valid HTTP or HTTPS URL',
      }),
    status: z.enum(['draft', 'published']).optional().default('published'),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: 'End date/time must be strictly after the start date/time',
      path: ['endDate'],
    }
  );

const updateEventSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    summary: z.string().trim().min(10).max(300).optional(),
    description: z.string().trim().min(20).optional(),
    bannerUrl: z
      .string()
      .trim()
      .refine((val) => urlRegex.test(val), {
        message: 'Banner URL must be a valid HTTP or HTTPS URL',
      })
      .optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid ISO date',
      })
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'End date must be a valid ISO date',
      })
      .optional(),
    format: z.enum(['online', 'in-person']).optional(),
    venue: z.string().trim().min(3).optional(),
    category: z
      .enum(['Technology', 'Design', 'Business', 'Marketing', 'Workshop', 'Conference', 'Other'])
      .optional(),
    tags: z.array(z.string().trim()).optional(),
    targetAudience: z.string().trim().min(3).optional(),
    registrationUrl: z
      .string()
      .trim()
      .refine((val) => urlRegex.test(val), {
        message: 'Registration URL must be a valid HTTP or HTTPS URL',
      })
      .optional(),
    status: z.enum(['draft', 'published']).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date/time must be strictly after the start date/time',
      path: ['endDate'],
    }
  );

module.exports = {
  createEventSchema,
  updateEventSchema,
};

