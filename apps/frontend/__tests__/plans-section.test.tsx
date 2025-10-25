import { render, screen } from '@testing-library/react';

import { PlansSection } from '../components/plans-section';

describe('PlansSection', () => {
  it('renders all seller plans', () => {
    render(<PlansSection />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });
});
