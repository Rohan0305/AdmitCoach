import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Credit package configurations
export const CREDIT_PACKAGES = [
  {
    id: 'credits_5',
    name: '5 Interview Credits',
    credits: 5,
    price: 1999, // $19.99 in cents
    priceDisplay: '$19.99',
    description: 'Perfect for getting started with mock interviews'
  },
  {
    id: 'credits_10',
    name: '10 Interview Credits',
    credits: 10,
    price: 3499, // $34.99 in cents
    priceDisplay: '$34.99',
    description: 'Most popular choice for serious applicants',
    popular: true
  },
  {
    id: 'credits_20',
    name: '20 Interview Credits',
    credits: 20,
    price: 5999, // $59.99 in cents
    priceDisplay: '$59.99',
    description: 'Best value for comprehensive interview preparation'
  }
]; 