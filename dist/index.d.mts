import * as react_jsx_runtime from 'react/jsx-runtime';

interface WavesProps {
    /** Extra CSS class on the container */
    className?: string;
    /** Background fill colour of the container (default: transparent) */
    backgroundColor?: string;
    /** Gap in px between lines — smaller = more lines (default: 8) */
    xGap?: number;
    /** Gap in px between points on each line (default: 8) */
    yGap?: number;
    /** Max horizontal wave displacement in px (default: 20) */
    waveX?: number;
    /** Max vertical wave displacement in px (default: 10) */
    waveY?: number;
    /** Colour palette to cycle through — array of [R,G,B] tuples */
    palette?: [number, number, number][];
    /** Duration in ms for one full colour cycle (default: 5000) */
    colorCycle?: number;
    /** Target interval between frames in ms — higher = fewer fps (default: 42 ≈ 24fps) */
    frameInterval?: number;
    /** CSS mask-image applied to the container for gradient fade effects */
    maskImage?: string;
}
declare function Waves({ className, backgroundColor, xGap, yGap, waveX, waveY, palette, colorCycle, frameInterval, maskImage, }: WavesProps): react_jsx_runtime.JSX.Element;

export { Waves, type WavesProps };
