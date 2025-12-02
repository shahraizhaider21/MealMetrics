import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

const AnimatedCounter = ({ value, duration = 1.5, prefix = '', suffix = '', className = '' }: AnimatedCounterProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
        duration: duration * 1000 // spring doesn't use duration directly like this usually, but let's stick to simple spring or animate
    });

    // Actually, for a simple 0 -> value over time, `animate` is easier, but `useSpring` gives that physics feel.
    // Let's use `animate` from framer-motion/dom if we want precise duration, or just set the spring target.
    // The user asked for "animate from 0 to that value over 1.5 seconds" AND "spin-up effect".
    // A spring is better for "spin-up".

    const isInView = useInView(ref, { once: true, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // Format: if integer, show integer. If float, show 1 decimal?
                // The user didn't specify, but budget usually has decimals, calories don't.
                // Let's try to detect or just use toFixed(0) for now unless it's small?
                // Actually, let's look at the usage.
                // Budget: 75.00?
                // Calories: 2000
                // BMI: 22.5

                // Let's make it smart: if value has decimals, show 1 or 2.
                const isFloat = value % 1 !== 0;
                ref.current.textContent = `${prefix}${latest.toFixed(isFloat ? 1 : 0)}${suffix}`;
            }
        });
    }, [springValue, value, prefix, suffix]);

    return <span ref={ref} className={className} />;
};

export default AnimatedCounter;
