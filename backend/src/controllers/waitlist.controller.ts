import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { emailTemplates, mailService } from '../services/mail.service';

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  recipeId: z.literal('recipe-02').default('recipe-02'),
  source: z.enum(['collection_page', 'the_lab']).default('collection_page'),
});

export async function joinWaitlist(req: Request, res: Response, next: NextFunction) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Please enter a valid email address for the Recipe 02 waitlist.' });
  try {
    // The unique database constraint makes concurrent and repeated signups safe.
    const entry = await prisma.recipeWaitlist.upsert({
      where: { email_recipeId: { email: parsed.data.email, recipeId: parsed.data.recipeId } },
      create: { ...parsed.data, recipeName: 'Recipe 02' },
      update: {},
    });
    void mailService.sendCustomerAndTeam(
      entry.email,
      emailTemplates.waitlist(entry.email, entry.recipeName),
      emailTemplates.internal('New waitlist signup', [`Recipe: ${entry.recipeName}`, `Email: ${entry.email}`, `Source: ${entry.source || 'unknown'}`]),
    );
    return res.status(200).json({ success: true, message: 'You are on the Recipe 02 waitlist.' });
  } catch (error) {
    // Some Prisma versions emulate upsert; a concurrent insert is still a successful signup.
    if ((error as { code?: string }).code === 'P2002') return res.status(200).json({ success: true, message: 'You are on the Recipe 02 waitlist.' });
    console.error('Waitlist signup failed', error);
    return res.status(503).json({ success: false, message: 'Unable to save your email right now. Please try again shortly.' });
  }
}

export async function getWaitlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { recipeId } = req.query;
    const filter = recipeId ? { recipeId: String(recipeId) } : {};

    const entries = await prisma.recipeWaitlist.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      count: entries.length,
      waitlist: entries,
    });
  } catch (error) {
    next(error);
  }
}
