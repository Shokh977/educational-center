import { motion, AnimatePresence } from 'framer-motion';
import { slideVariants } from '../../styles/animations';

interface AnimatedSlideProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedSlide = ({ children, className }: AnimatedSlideProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
