interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/90 ${className}`}>
      {children}
    </div>
  );
}

export default Card;