import { motion } from 'framer-motion';
import { buttonAnimation } from '../animations/variants';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AnimatedButton = ({ children, onClick, className }: Props) => (
  <motion.button
    className={className}
    whileHover="hover"
    whileTap="tap"
    variants={buttonAnimation}
    onClick={onClick}
  >
    {children}
  </motion.button>
);
