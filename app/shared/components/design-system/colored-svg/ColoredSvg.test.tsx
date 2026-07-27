import { render, screen } from '@testing-library/react';
import React from 'react';

import { Svg } from './ColoredSvg';

const MockSvg = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg data-testid="icon-svg" {...props}>
      <rect width="100%" height="100%" />
    </svg>
  );
};

const testAlt = 'Test Icon';

describe('ColoredSvg component', () => {
  it('should render with color prop and applies color to svg children', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="#123456" />);
    const wrapper = screen.getByTestId('img');
    expect(wrapper).toBeInTheDocument();
    const svg = screen.getByTestId('icon-svg');
    expect(svg).toHaveStyle('width: 24px');
    expect(svg).toHaveStyle('height: 24px');
  });

  it('should render with fill and stroke props and applies them to svg children', () => {
    render(<Svg Component={MockSvg} alt={testAlt} fill="#ff0000" stroke="#00ff00" />);
    const wrapper = screen.getByTestId('img');
    expect(wrapper).toBeInTheDocument();
    const svg = screen.getByTestId('icon-svg');
    expect(svg).toHaveStyle('width: 24px');
    expect(svg).toHaveStyle('height: 24px');
  });

  it('should render with custom width and height', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="#000" width="48px" height="32px" />);
    const svg = screen.getByTestId('icon-svg');
    expect(svg).toHaveStyle('width: 48px');
    expect(svg).toHaveStyle('height: 32px');
  });

  it('should throw error if no color, fill, or stroke is provided', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} />)).toThrow(
      'At least one of color, fill, or stroke must be provided'
    );
  });

  it('should throw error if invalid color is provided', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} color="not-a-color" />)).toThrow(
      'Invalid color value for color: not-a-color'
    );
  });

  it('should throw error if invalid fill is provided', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} fill="not-a-color" />)).toThrow(
      'Invalid color value for fill: not-a-color'
    );
  });

  it('shold throw error if invalid stroke is provided', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} stroke="not-a-color" />)).toThrow(
      'Invalid color value for stroke: not-a-color'
    );
  });

  it('should throw error if invalid width/height is provided', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} color="#000" width="bad" height="bad" />)).toThrow(
      /Invalid size values: width=bad, height=bad/
    );
  });

  it('should apply aria-label and role correctly', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="#000" />);
    const wrapper = screen.getByTestId('img');
    expect(wrapper).toHaveAttribute('aria-label', testAlt);
  });

  it('should apply custom sx prop', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="#000" sx={{ backgroundColor: 'yellow' }} />);
    const wrapper = screen.getByTestId('img');
    expect(wrapper).toHaveStyle('background-color: yellow');
  });

  it('should validate and accept correct rgb and rgba colors', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="rgb(255, 99, 71)" />);
    render(<Svg Component={MockSvg} alt={testAlt} fill="rgba(0, 0, 0, 0.5)" />);

    expect(screen.getAllByTestId('img')).toHaveLength(2);
  });

  it('should validate and accept none as a color', () => {
    render(<Svg Component={MockSvg} alt={testAlt} color="none" />);
    expect(screen.getByTestId('img')).toBeInTheDocument();
  });

  it('should throw error if rgb values are out of 0-255 range', () => {
    expect(() => render(<Svg Component={MockSvg} alt={testAlt} color="rgb(300, 0, 0)" />)).toThrow(
      'Invalid color value for color: rgb(300, 0, 0)'
    );
  });
});
