export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const slideIn = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const buttonAnimation = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};
