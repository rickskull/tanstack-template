import { subscriptionPlans } from '../src/modules/subscriptions/services/subscription.service';

describe('subscription plans', () => {
  it('should expose four plans with proper commissions', () => {
    expect(subscriptionPlans).toHaveLength(4);
    const elite = subscriptionPlans.find((plan) => plan.name === 'Elite');
    expect(elite?.commission).toBeCloseTo(0.07);
  });
});
