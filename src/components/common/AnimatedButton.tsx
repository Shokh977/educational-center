import { motion } from 'framer-motion';
import { buttonVariants } from '../../styles/animations';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AnimatedButton = ({ children, onClick, className }: AnimatedButtonProps) => {
  return (
    <motion.button
      className={className}
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};
