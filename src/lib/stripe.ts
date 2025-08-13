import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Client-side Stripe instance
export const getStripe = async () => {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key is missing');
      return null;
    }
    
    console.log('Loading Stripe with key:', publishableKey.substring(0, 20) + '...');
    const stripe = await loadStripe(publishableKey);
    
    if (!stripe) {
      console.error('Failed to load Stripe instance');
      return null;
    }
    
    console.log('Stripe loaded successfully');
    return stripe;
  } catch (error) {
    console.error('Error loading Stripe:', error);
    return null;
  }
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