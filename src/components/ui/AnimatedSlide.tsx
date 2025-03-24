import { motion } from 'framer-motion';
import { slideIn } from '../animations/variants';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedSlide = ({ children, className }: Props) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={slideIn}
  >
    {children}
  </motion.div>
);
